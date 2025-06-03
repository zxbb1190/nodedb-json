import * as fs from 'fs';
import * as _ from 'lodash';
import { 
  AnyValue, 
  PredicateFunction, 
  UpdaterObject, 
  DbOptions, 
  IndexDefinition, 
  IndexType, 
  IndexStore,
  QueryOptions,
  QueryResult,
  SortOption,
  SortDirection,
  PaginationOption,
  PaginationResult,
  AggregationOption,
  AggregationResult,
  AggregationType
} from './types';

/**
 * A class to manage JSON-based database operations.
 */
class NodedbJson {
  private filePath: string;
  private data: Record<string, any>;
  private options: DbOptions;
  private _pendingChanges: number = 0;
  private _indexes: IndexStore = {};
  private _indexDefinitions: Record<string, Record<string, IndexDefinition>> = {};
  
  /**
   * Creates an instance of NodedbJson.
   * @param {string} filePath - The path to the JSON file.
   * @param {DbOptions} [options] - Database options.
   */
  constructor(filePath: string, options: DbOptions = {}) {
    this.filePath = filePath;
    this.options = {
      autoSave: true,
      createIfNotExists: true,
      defaultValue: {},
      enableIndexing: true,
      autoIndex: true,
      ...options
    };
    this.data = this.readJSONFile();
    
    // 自动创建索引
    if (this.options.enableIndexing && this.options.autoIndex) {
      this._rebuildAllIndexes();
    }
  }

  /**
   * Reads the JSON file.
   * @returns {object} - The parsed JSON data.
   */
  private readJSONFile(): Record<string, any> {
    if (!fs.existsSync(this.filePath)) {
      if (this.options.createIfNotExists) {
        fs.writeFileSync(this.filePath, JSON.stringify(this.options.defaultValue || {}), "utf-8");
      } else {
        throw new Error(`Database file does not exist: ${this.filePath}`);
      }
    }
    const fileData = fs.readFileSync(this.filePath, "utf-8");
    return JSON.parse(fileData);
  }

  /**
   * Writes the JSON data to the file.
   */
  private writeJSONFile(): void {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
    this._pendingChanges = 0;
  }

  /**
   * Manually save changes to file.
   * @returns {NodedbJson} - The instance of the database for chaining.
   */
  save(): NodedbJson {
    if (this._pendingChanges > 0) {
      this.writeJSONFile();
    }
    return this;
  }

  /**
   * Sets a value in the JSON data.
   * @param {string} key - The key to set.
   * @param {any} value - The value to set.
   * @returns {NodedbJson} - The instance of the database for chaining.
   */
  set(key: string, value: AnyValue): NodedbJson {
    // 检查是否需要更新索引
    const oldValue = _.get(this.data, key);
    const needsIndexUpdate = this.options.enableIndexing && 
      (Array.isArray(oldValue) || Array.isArray(value)) && 
      this._hasIndexDefinition(key);
    
    _.set(this.data, key, value);
    this._pendingChanges++;
    
    // 如果修改了带索引的数组，重建索引
    if (needsIndexUpdate) {
      this._rebuildIndexesForKey(key);
    }
    
    if (this.options.autoSave) {
      this.writeJSONFile();
    }
    return this;
  }

  /**
   * Gets a value from the JSON data.
   * @param {string} key - The key to get.
   * @returns {any} - The value.
   */
  get(key: string): AnyValue {
    return _.get(this.data, key);
  }

  /**
   * Checks if a key exists in the JSON data.
   * @param {string} key - The key to check.
   * @returns {boolean} - True if the key exists, otherwise false.
   */
  has(key: string): boolean {
    return _.has(this.data, key);
  }

  /**
   * Updates a value in the JSON data.
   * @param {string} key - The key to update.
   * @param {function|object} predicateOrUpdater - The predicate function or updater object.
   * @param {object} [updater] - The updater object if a predicate function is provided.
   * @returns {NodedbJson} - The instance of the database for chaining.
   */
  update<T>(key: string, predicateOrUpdater: PredicateFunction<T> | UpdaterObject, updater?: UpdaterObject): NodedbJson {
    const data = this.get(key);
    if (Array.isArray(data)) {
      // 如果使用索引进行更新
      if (typeof predicateOrUpdater === 'object' && 
          this.options.enableIndexing && 
          this._hasIndexDefinition(key)) {
        
        // 尝试使用索引查找
        const foundIndex = this._findIndexedItemPosition(key, predicateOrUpdater);
        if (foundIndex !== -1) {
          _.merge(data[foundIndex], updater);
          this._pendingChanges++;
          // 更新索引
          this._rebuildIndexesForKey(key);
        } else {
          throw new Error(`No item found matching the predicate.`);
        }
      } else {
        // 常规查找
        const item = _.find(data, predicateOrUpdater as PredicateFunction<T>);
        if (item && updater) {
          _.merge(item, updater);
          this._pendingChanges++;
          
          // 如果有索引，需要更新
          if (this.options.enableIndexing && this._hasIndexDefinition(key)) {
            this._rebuildIndexesForKey(key);
          }
        } else if (!item) {
          throw new Error(`No item found matching the predicate.`);
        }
      }
    } else if (_.isObject(data)) {
      _.update(this.data, key, predicateOrUpdater as any);
      this._pendingChanges++;
    } else {
      throw new Error(`Key "${key}" does not reference a collection or array.`);
    }
    
    if (this.options.autoSave) {
      this.writeJSONFile();
    }
    return this;
  }

  /**
   * Deletes a value from the JSON data.
   * @param {string} key - The key to delete.
   * @param {function|string[]} [predicateOrKeys] - The predicate function or array of keys to delete.
   * @param {string} [field='id'] - The field to match for array deletion.
   * @returns {NodedbJson} - The instance of the database for chaining.
   */
  delete<T>(key: string, predicateOrKeys?: PredicateFunction<T> | string[], field: string = 'id'): NodedbJson {
    const data = this.get(key);
    const hasIndex = this.options.enableIndexing && this._hasIndexDefinition(key);
    
    if (Array.isArray(data)) {
      if (typeof predicateOrKeys === 'function') {
        _.remove(data, predicateOrKeys as PredicateFunction<T>);
      } else if (Array.isArray(predicateOrKeys)) {
        // 如果有索引，尝试使用索引删除
        if (hasIndex && this._hasIndexOnField(key, field)) {
          for (const fieldValue of predicateOrKeys) {
            const index = this._getItemIndexByField(key, field, fieldValue);
            if (index !== -1) {
              data.splice(index, 1);
            }
          }
        } else {
          _.remove(data, (item: any) => predicateOrKeys.includes(item[field]));
        }
      } else {
        throw new Error(`Predicate or keys array must be provided for array deletion.`);
      }
    } else if (this.has(key)) {
      if (Array.isArray(predicateOrKeys)) {
        predicateOrKeys.forEach(itemKey => {
          _.unset(this.data[key], itemKey);
        });
      } else {
        _.unset(this.data, key);
      }
    } else {
      throw new Error(`Key "${key}" does not exist.`);
    }
    
    // 如果有索引，更新索引
    if (hasIndex) {
      this._rebuildIndexesForKey(key);
    }
    
    this._pendingChanges++;
    if (this.options.autoSave) {
      this.writeJSONFile();
    }
    return this;
  }

  /**
   * Finds a value in the JSON data.
   * @param {string} key - The key to find.
   * @param {function} predicate - The predicate function to match.
   * @returns {any} - The found value.
   */
  find<T>(key: string, predicate: PredicateFunction<T>): T | undefined {
    const data = this.get(key);
    if (Array.isArray(data)) {
      return _.find(data, predicate);
    } else if (_.isObject(data)) {
      return _.find(Object.values(data), predicate);
    } else {
      throw new Error(`Key "${key}" does not reference a collection or array.`);
    }
  }

  /**
   * Finds a value by field and value using index if available.
   * @param {string} key - The key to find.
   * @param {string} field - The field to match.
   * @param {any} value - The value to match.
   * @returns {any} - The found value.
   */
  findByField<T>(key: string, field: string, value: any): T | undefined {
    const data = this.get(key);
    
    if (!Array.isArray(data)) {
      throw new Error(`Key "${key}" does not reference an array.`);
    }
    
    // 使用索引进行查找
    if (this.options.enableIndexing && this._hasIndexOnField(key, field)) {
      const index = this._getItemIndexByField(key, field, value);
      return index !== -1 ? data[index] as T : undefined;
    } 
    
    // 常规查找
    return _.find(data, item => item[field] === value);
  }

  /**
   * Filters values in the JSON data.
   * @param {string} key - The key to filter.
   * @param {function} predicate - The predicate function to match.
   * @returns {any[]} - The filtered values.
   */
  filter<T>(key: string, predicate: PredicateFunction<T>): T[] {
    const data = this.get(key);
    if (Array.isArray(data)) {
      return _.filter(data, predicate);
    } else if (_.isObject(data)) {
      return _.filter(Object.values(data), predicate);
    } else {
      throw new Error(`Key "${key}" does not reference a collection or array.`);
    }
  }
  
  /**
   * Filters values by field and possible values using index if available.
   * @param {string} key - The key to filter.
   * @param {string} field - The field to match.
   * @param {any[]} values - The values to match.
   * @returns {any[]} - The filtered values.
   */
  filterByField<T>(key: string, field: string, values: any[]): T[] {
    const data = this.get(key);
    
    if (!Array.isArray(data)) {
      throw new Error(`Key "${key}" does not reference an array.`);
    }
    
    // 使用索引进行过滤
    if (this.options.enableIndexing && this._hasIndexOnField(key, field)) {
      const result: T[] = [];
      
      for (const value of values) {
        const indexes = this._getItemIndexesByField(key, field, value);
        for (const index of indexes) {
          result.push(data[index] as T);
        }
      }
      
      return result;
    }
    
    // 常规过滤
    return _.filter(data, item => values.includes(item[field]));
  }
  
  /**
   * Pushes a value into an array in the JSON data.
   * @param {string} key - The key to push to.
   * @param {any|any[]} value - The value or values to push.
   * @returns {NodedbJson} - The instance of the database for chaining.
   */
  push(key: string, value: AnyValue | AnyValue[]): NodedbJson {
    if (!this.has(key)) {
      if (Array.isArray(value)) {
        this.set(key, value);
      } else {
        this.set(key, [value]);
      }
    } else {
      const array = this.get(key);
      if (Array.isArray(array)) {
        if (Array.isArray(value)) {
          array.push(...value);
        } else {
          array.push(value);
        }
        this._pendingChanges++;
        
        // 如果有索引，更新索引
        if (this.options.enableIndexing && this._hasIndexDefinition(key)) {
          this._rebuildIndexesForKey(key);
        }
        
        if (this.options.autoSave) {
          this.writeJSONFile();
        }
      } else {
        throw new Error(`Key "${key}" is not an array.`);
      }
    }
    return this;
  }
  
  /**
   * Executes multiple operations in batch.
   * @param {Array<{method: string, args: any[]}>} operations - Array of operations to execute.
   * @returns {NodedbJson} - The instance of the database for chaining.
   */
  batch(operations: Array<{method: string, args: any[]}>): NodedbJson {
    const originalAutoSave = this.options.autoSave;
    this.options.autoSave = false;
    
    try {
      operations.forEach(op => {
        const { method, args } = op;
        if (typeof this[method as keyof NodedbJson] === 'function') {
          (this[method as keyof NodedbJson] as Function).apply(this, args);
        }
      });
      
      this.writeJSONFile();
    } finally {
      this.options.autoSave = originalAutoSave;
    }
    
    return this;
  }
  
  /**
   * 创建一个索引
   * @param {string} key - 要索引的集合路径
   * @param {IndexDefinition} indexDefinition - 索引定义
   * @returns {NodedbJson} - 实例，支持链式调用
   */
  createIndex(key: string, indexDefinition: IndexDefinition): NodedbJson {
    if (!this.options.enableIndexing) {
      throw new Error('Indexing is not enabled. Set enableIndexing option to true.');
    }
    
    const data = this.get(key);
    if (!Array.isArray(data)) {
      throw new Error(`Cannot create index on non-array data at "${key}"`);
    }
    
    // 保存索引定义
    if (!this._indexDefinitions[key]) {
      this._indexDefinitions[key] = {};
    }
    
    this._indexDefinitions[key][indexDefinition.field] = indexDefinition;
    
    // 创建索引
    this._buildIndex(key, indexDefinition);
    
    return this;
  }
  
  /**
   * 删除索引
   * @param {string} key - 集合路径
   * @param {string} field - 字段名
   * @returns {NodedbJson} - 实例，支持链式调用
   */
  dropIndex(key: string, field: string): NodedbJson {
    if (!this.options.enableIndexing) {
      return this;
    }
    
    if (this._indexDefinitions[key] && this._indexDefinitions[key][field]) {
      delete this._indexDefinitions[key][field];
      
      // 如果没有索引了，删除整个键
      if (Object.keys(this._indexDefinitions[key]).length === 0) {
        delete this._indexDefinitions[key];
      }
      
      // 删除索引数据
      const indexKey = `${key}:${field}`;
      if (this._indexes[indexKey]) {
        delete this._indexes[indexKey];
      }
    }
    
    return this;
  }
  
  /**
   * 获取所有索引信息
   * @returns {Record<string, Record<string, IndexDefinition>>} - 索引定义
   */
  getIndexes(): Record<string, Record<string, IndexDefinition>> {
    return _.cloneDeep(this._indexDefinitions);
  }
  
  /**
   * 检查指定路径是否有索引定义
   * @param {string} key - 集合路径
   * @returns {boolean} - 是否有索引
   */
  private _hasIndexDefinition(key: string): boolean {
    return !!this._indexDefinitions[key] && Object.keys(this._indexDefinitions[key]).length > 0;
  }
  
  /**
   * 检查指定路径的指定字段是否有索引
   * @param {string} key - 集合路径
   * @param {string} field - 字段名
   * @returns {boolean} - 是否有索引
   */
  private _hasIndexOnField(key: string, field: string): boolean {
    return !!this._indexDefinitions[key] && !!this._indexDefinitions[key][field];
  }
  
  /**
   * 重建所有索引
   */
  private _rebuildAllIndexes(): void {
    // 清空所有索引
    this._indexes = {};
    
    // 重建每个定义的索引
    for (const key in this._indexDefinitions) {
      for (const field in this._indexDefinitions[key]) {
        this._buildIndex(key, this._indexDefinitions[key][field]);
      }
    }
  }
  
  /**
   * 重建指定路径的所有索引
   * @param {string} key - 集合路径
   */
  private _rebuildIndexesForKey(key: string): void {
    if (!this._indexDefinitions[key]) {
      return;
    }
    
    // 重建该路径的所有索引
    for (const field in this._indexDefinitions[key]) {
      this._buildIndex(key, this._indexDefinitions[key][field]);
    }
  }
  
  /**
   * 构建索引
   * @param {string} key - 集合路径
   * @param {IndexDefinition} indexDef - 索引定义
   */
  private _buildIndex(key: string, indexDef: IndexDefinition): void {
    const data = this.get(key);
    if (!Array.isArray(data)) {
      return;
    }
    
    const indexKey = `${key}:${indexDef.field}`;
    this._indexes[indexKey] = {};
    
    // 遍历数组构建索引
    data.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        return;
      }
      
      const fieldValue = item[indexDef.field];
      if (fieldValue === undefined || fieldValue === null) {
        return;
      }
      
      const strValue = String(fieldValue);
      
      // 根据索引类型处理
      if (indexDef.type === 'unique') {
        // 唯一索引
        this._indexes[indexKey][strValue] = index;
      } else {
        // 多值索引
        if (!this._indexes[indexKey][strValue]) {
          this._indexes[indexKey][strValue] = [];
        }
        (this._indexes[indexKey][strValue] as number[]).push(index);
      }
    });
  }
  
  /**
   * 根据对象查找索引位置
   * @param {string} key - 集合路径
   * @param {object} obj - 查询对象
   * @returns {number} - 找到的索引位置，-1表示未找到
   */
  private _findIndexedItemPosition(key: string, obj: Record<string, any>): number {
    // 检查是否有匹配的索引
    for (const field in obj) {
      if (this._hasIndexOnField(key, field)) {
        const index = this._getItemIndexByField(key, field, obj[field]);
        if (index !== -1) {
          return index;
        }
      }
    }
    
    return -1;
  }
  
  /**
   * 根据字段和值获取数组中的项索引
   * @param {string} key - 集合路径
   * @param {string} field - 字段名
   * @param {any} value - 字段值
   * @returns {number} - 找到的索引位置，-1表示未找到
   */
  private _getItemIndexByField(key: string, field: string, value: any): number {
    const indexKey = `${key}:${field}`;
    const strValue = String(value);
    
    if (!this._indexes[indexKey] || this._indexes[indexKey][strValue] === undefined) {
      return -1;
    }
    
    const indexData = this._indexes[indexKey][strValue];
    return typeof indexData === 'number' ? indexData : indexData[0] || -1;
  }
  
  /**
   * 根据字段和值获取数组中的多个项索引
   * @param {string} key - 集合路径
   * @param {string} field - 字段名
   * @param {any} value - 字段值
   * @returns {number[]} - 找到的索引位置数组
   */
  private _getItemIndexesByField(key: string, field: string, value: any): number[] {
    const indexKey = `${key}:${field}`;
    const strValue = String(value);
    
    if (!this._indexes[indexKey] || this._indexes[indexKey][strValue] === undefined) {
      return [];
    }
    
    const indexData = this._indexes[indexKey][strValue];
    return typeof indexData === 'number' ? [indexData] : indexData;
  }

  /**
   * 复杂查询操作，支持排序、分页、聚合等
   * @param {string} key - 集合路径
   * @param {QueryOptions} options - 查询选项
   * @returns {QueryResult} - 查询结果
   */
  query<T = any>(key: string, options: QueryOptions<T> = {}): QueryResult<T> {
    const startTime = performance.now();
    
    const data = this.get(key);
    if (!Array.isArray(data)) {
      throw new Error(`Key "${key}" does not reference an array.`);
    }
    
    const totalRecords = data.length;
    let filteredData = [...data];
    let usedIndex = false;
    
    // 1. 应用过滤条件 (WHERE)
    if (options.where) {
      const filterResult = this._applyFilter(key, filteredData, options.where);
      filteredData = filterResult.data;
      usedIndex = filterResult.usedIndex;
    }
    
    const filteredRecords = filteredData.length;
    
    // 2. 应用排序 (ORDER BY)
    if (options.sort) {
      filteredData = this._applySort(filteredData, options.sort);
    }
    
    // 3. 应用跳过和限制 (SKIP/LIMIT)
    if (options.skip && options.skip > 0) {
      filteredData = filteredData.slice(options.skip);
    }
    
    if (options.limit && options.limit > 0) {
      filteredData = filteredData.slice(0, options.limit);
    }
    
    // 4. 应用分页 (PAGINATION)
    let paginationInfo: PaginationResult<T>['pagination'] | undefined;
    if (options.pagination) {
      const paginationResult = this._applyPagination(filteredData, options.pagination);
      filteredData = paginationResult.data;
      paginationInfo = paginationResult.pagination;
    }
    
    // 5. 应用字段选择 (SELECT)
    if (options.select && options.select.length > 0) {
      filteredData = this._applySelect(filteredData, options.select);
    }
    
    // 6. 计算聚合 (AGGREGATION)
    let aggregations: AggregationResult[] | undefined;
    if (options.aggregation && options.aggregation.length > 0) {
      // 注意：聚合使用原始过滤后的数据（未分页）
      const originalFiltered = this.get(key);
      let aggregationData = Array.isArray(originalFiltered) ? [...originalFiltered] : [];
      
      if (options.where) {
        const filterResult = this._applyFilter(key, aggregationData, options.where);
        aggregationData = filterResult.data;
      }
      
      aggregations = this._applyAggregation(aggregationData, options.aggregation);
    }
    
    const executionTime = performance.now() - startTime;
    
    return {
      data: filteredData,
      pagination: paginationInfo,
      aggregations,
      stats: {
        totalRecords,
        filteredRecords,
        executionTime,
        usedIndex
      }
    };
  }

  /**
   * 应用过滤条件
   * @param {string} key - 集合路径
   * @param {T[]} data - 数据数组
   * @param {PredicateFunction<T> | Record<string, any>} where - 过滤条件
   * @returns {{data: T[], usedIndex: boolean}} - 过滤结果
   */
  private _applyFilter<T>(
    key: string, 
    data: T[], 
    where: PredicateFunction<T> | Record<string, any>
  ): { data: T[], usedIndex: boolean } {
    let usedIndex = false;
    
    if (typeof where === 'function') {
      // 使用谓词函数过滤
      return { data: data.filter(where as PredicateFunction<T>), usedIndex: false };
    }
    
    // 使用对象条件过滤，尝试使用索引优化
    if (typeof where === 'object' && this.options.enableIndexing) {
      // 检查是否可以使用索引
      const indexableFields = Object.keys(where).filter(field => 
        this._hasIndexOnField(key, field)
      );
      
      if (indexableFields.length > 0) {
        // 使用第一个有索引的字段进行快速过滤
        const field = indexableFields[0];
        const value = where[field];
        const indexes = this._getItemIndexesByField(key, field, value);
        
        if (indexes.length > 0) {
          usedIndex = true;
          let filteredData = indexes.map(index => data[index]).filter(Boolean);
          
          // 应用其他条件
          const otherConditions = _.omit(where, field);
          if (Object.keys(otherConditions).length > 0) {
            filteredData = filteredData.filter(item => 
              this._matchesConditions(item, otherConditions)
            );
          }
          
          return { data: filteredData, usedIndex };
        }
      }
    }
    
    // 常规过滤
    const filteredData = data.filter(item => 
      this._matchesConditions(item, where as Record<string, any>)
    );
    
    return { data: filteredData, usedIndex };
  }

  /**
   * 检查项是否匹配条件
   * @param {any} item - 数据项
   * @param {Record<string, any>} conditions - 条件对象
   * @returns {boolean} - 是否匹配
   */
  private _matchesConditions(item: any, conditions: Record<string, any>): boolean {
    for (const [field, value] of Object.entries(conditions)) {
      if (_.get(item, field) !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * 应用排序
   * @param {T[]} data - 数据数组
   * @param {SortOption | SortOption[]} sort - 排序选项
   * @returns {T[]} - 排序后的数据
   */
  private _applySort<T>(data: T[], sort: SortOption | SortOption[]): T[] {
    const sortOptions = Array.isArray(sort) ? sort : [sort];
    
    return _.orderBy(
      data,
      sortOptions.map(option => option.field),
      sortOptions.map(option => option.direction)
    );
  }

  /**
   * 应用分页
   * @param {T[]} data - 数据数组
   * @param {PaginationOption} pagination - 分页选项
   * @returns {PaginationResult<T>} - 分页结果
   */
  private _applyPagination<T>(data: T[], pagination: PaginationOption): PaginationResult<T> {
    const { page, pageSize } = pagination;
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      pagination: {
        currentPage,
        pageSize,
        totalItems,
        totalPages,
        hasPrevious: currentPage > 1,
        hasNext: currentPage < totalPages
      }
    };
  }

  /**
   * 应用字段选择
   * @param {T[]} data - 数据数组
   * @param {string[]} select - 选择的字段
   * @returns {T[]} - 选择后的数据
   */
  private _applySelect<T>(data: T[], select: string[]): T[] {
    return data.map(item => _.pick(item, select)) as T[];
  }

  /**
   * 应用聚合操作
   * @param {any[]} data - 数据数组
   * @param {AggregationOption[]} aggregations - 聚合选项
   * @returns {AggregationResult[]} - 聚合结果
   */
  private _applyAggregation(data: any[], aggregations: AggregationOption[]): AggregationResult[] {
    return aggregations.map(agg => {
      switch (agg.type) {
        case 'count':
          return {
            type: 'count',
            value: data.length
          };
          
        case 'sum':
          if (!agg.field) {
            throw new Error('Sum aggregation requires a field');
          }
          return {
            type: 'sum',
            field: agg.field,
            value: _.sumBy(data, agg.field)
          };
          
        case 'avg':
          if (!agg.field) {
            throw new Error('Average aggregation requires a field');
          }
          return {
            type: 'avg',
            field: agg.field,
            value: _.meanBy(data, agg.field)
          };
          
        case 'min':
          if (!agg.field) {
            throw new Error('Min aggregation requires a field');
          }
          return {
            type: 'min',
            field: agg.field,
            value: _.minBy(data, agg.field)?.[agg.field] || 0
          };
          
        case 'max':
          if (!agg.field) {
            throw new Error('Max aggregation requires a field');
          }
          return {
            type: 'max',
            field: agg.field,
            value: _.maxBy(data, agg.field)?.[agg.field] || 0
          };
          
        case 'group':
          if (!agg.groupBy) {
            throw new Error('Group aggregation requires a groupBy field');
          }
          return {
            type: 'group',
            groupBy: agg.groupBy,
            value: _.groupBy(data, agg.groupBy)
          };
          
        default:
          throw new Error(`Unsupported aggregation type: ${agg.type}`);
      }
    });
  }

  /**
   * 快速排序查询（优化版本）
   * @param {string} key - 集合路径
   * @param {SortOption | SortOption[]} sort - 排序选项
   * @param {number} [limit] - 限制返回数量
   * @returns {T[]} - 排序后的数据
   */
  orderBy<T = any>(key: string, sort: SortOption | SortOption[], limit?: number): T[] {
    const data = this.get(key);
    if (!Array.isArray(data)) {
      throw new Error(`Key "${key}" does not reference an array.`);
    }
    
    const sortOptions = Array.isArray(sort) ? sort : [sort];
    let sortedData = _.orderBy(
      data,
      sortOptions.map(option => option.field),
      sortOptions.map(option => option.direction)
    );
    
    if (limit && limit > 0) {
      sortedData = sortedData.slice(0, limit);
    }
    
    return sortedData;
  }

  /**
   * 快速分页查询
   * @param {string} key - 集合路径
   * @param {number} page - 页码（从1开始）
   * @param {number} pageSize - 每页数量
   * @param {PredicateFunction<T> | Record<string, any>} [where] - 过滤条件
   * @returns {PaginationResult<T>} - 分页结果
   */
  paginate<T = any>(
    key: string, 
    page: number, 
    pageSize: number, 
    where?: PredicateFunction<T> | Record<string, any>
  ): PaginationResult<T> {
    const result = this.query<T>(key, {
      where,
      pagination: { page, pageSize }
    });
    
    return {
      data: result.data,
      pagination: result.pagination!
    };
  }

  /**
   * 聚合查询
   * @param {string} key - 集合路径
   * @param {AggregationOption[]} aggregations - 聚合选项
   * @param {PredicateFunction<T> | Record<string, any>} [where] - 过滤条件
   * @returns {AggregationResult[]} - 聚合结果
   */
  aggregate<T = any>(
    key: string, 
    aggregations: AggregationOption[], 
    where?: PredicateFunction<T> | Record<string, any>
  ): AggregationResult[] {
    const result = this.query<T>(key, {
      where,
      aggregation: aggregations
    });
    
    return result.aggregations || [];
  }

  /**
   * 统计查询
   * @param {string} key - 集合路径
   * @param {PredicateFunction<T> | Record<string, any>} [where] - 过滤条件
   * @returns {number} - 统计数量
   */
  count<T = any>(key: string, where?: PredicateFunction<T> | Record<string, any>): number {
    const result = this.aggregate<T>(key, [{ type: 'count' }], where);
    return result[0]?.value as number || 0;
  }

  /**
   * 去重查询
   * @param {string} key - 集合路径
   * @param {string} field - 去重字段
   * @returns {any[]} - 去重后的值数组
   */
  distinct(key: string, field: string): any[] {
    const data = this.get(key);
    if (!Array.isArray(data)) {
      throw new Error(`Key "${key}" does not reference an array.`);
    }
    
    return _.uniqBy(data, field).map(item => _.get(item, field));
  }
}

// 导出类
export default NodedbJson;

// 为了兼容 CommonJS 导出
module.exports = NodedbJson;
module.exports.default = NodedbJson; 