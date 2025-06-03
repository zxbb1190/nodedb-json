import { AnyValue, PredicateFunction, UpdaterObject, DbOptions, IndexDefinition, QueryOptions, QueryResult, SortOption, PaginationResult, AggregationOption, AggregationResult } from './types';
/**
 * A class to manage JSON-based database operations.
 */
declare class NodedbJson {
    private filePath;
    private data;
    private options;
    private _pendingChanges;
    private _indexes;
    private _indexDefinitions;
    /**
     * Creates an instance of NodedbJson.
     * @param {string} filePath - The path to the JSON file.
     * @param {DbOptions} [options] - Database options.
     */
    constructor(filePath: string, options?: DbOptions);
    /**
     * Reads the JSON file.
     * @returns {object} - The parsed JSON data.
     */
    private readJSONFile;
    /**
     * Writes the JSON data to the file.
     */
    private writeJSONFile;
    /**
     * Manually save changes to file.
     * @returns {NodedbJson} - The instance of the database for chaining.
     */
    save(): NodedbJson;
    /**
     * Sets a value in the JSON data.
     * @param {string} key - The key to set.
     * @param {any} value - The value to set.
     * @returns {NodedbJson} - The instance of the database for chaining.
     */
    set(key: string, value: AnyValue): NodedbJson;
    /**
     * Gets a value from the JSON data.
     * @param {string} key - The key to get.
     * @returns {any} - The value.
     */
    get(key: string): AnyValue;
    /**
     * Checks if a key exists in the JSON data.
     * @param {string} key - The key to check.
     * @returns {boolean} - True if the key exists, otherwise false.
     */
    has(key: string): boolean;
    /**
     * Updates a value in the JSON data.
     * @param {string} key - The key to update.
     * @param {function|object} predicateOrUpdater - The predicate function or updater object.
     * @param {object} [updater] - The updater object if a predicate function is provided.
     * @returns {NodedbJson} - The instance of the database for chaining.
     */
    update<T>(key: string, predicateOrUpdater: PredicateFunction<T> | UpdaterObject, updater?: UpdaterObject): NodedbJson;
    /**
     * Deletes a value from the JSON data.
     * @param {string} key - The key to delete.
     * @param {function|string[]} [predicateOrKeys] - The predicate function or array of keys to delete.
     * @param {string} [field='id'] - The field to match for array deletion.
     * @returns {NodedbJson} - The instance of the database for chaining.
     */
    delete<T>(key: string, predicateOrKeys?: PredicateFunction<T> | string[], field?: string): NodedbJson;
    /**
     * Finds a value in the JSON data.
     * @param {string} key - The key to find.
     * @param {function} predicate - The predicate function to match.
     * @returns {any} - The found value.
     */
    find<T>(key: string, predicate: PredicateFunction<T>): T | undefined;
    /**
     * Finds a value by field and value using index if available.
     * @param {string} key - The key to find.
     * @param {string} field - The field to match.
     * @param {any} value - The value to match.
     * @returns {any} - The found value.
     */
    findByField<T>(key: string, field: string, value: any): T | undefined;
    /**
     * Filters values in the JSON data.
     * @param {string} key - The key to filter.
     * @param {function} predicate - The predicate function to match.
     * @returns {any[]} - The filtered values.
     */
    filter<T>(key: string, predicate: PredicateFunction<T>): T[];
    /**
     * Filters values by field and possible values using index if available.
     * @param {string} key - The key to filter.
     * @param {string} field - The field to match.
     * @param {any[]} values - The values to match.
     * @returns {any[]} - The filtered values.
     */
    filterByField<T>(key: string, field: string, values: any[]): T[];
    /**
     * Pushes a value into an array in the JSON data.
     * @param {string} key - The key to push to.
     * @param {any|any[]} value - The value or values to push.
     * @returns {NodedbJson} - The instance of the database for chaining.
     */
    push(key: string, value: AnyValue | AnyValue[]): NodedbJson;
    /**
     * Executes multiple operations in batch.
     * @param {Array<{method: string, args: any[]}>} operations - Array of operations to execute.
     * @returns {NodedbJson} - The instance of the database for chaining.
     */
    batch(operations: Array<{
        method: string;
        args: any[];
    }>): NodedbJson;
    /**
     * 创建一个索引
     * @param {string} key - 要索引的集合路径
     * @param {IndexDefinition} indexDefinition - 索引定义
     * @returns {NodedbJson} - 实例，支持链式调用
     */
    createIndex(key: string, indexDefinition: IndexDefinition): NodedbJson;
    /**
     * 删除索引
     * @param {string} key - 集合路径
     * @param {string} field - 字段名
     * @returns {NodedbJson} - 实例，支持链式调用
     */
    dropIndex(key: string, field: string): NodedbJson;
    /**
     * 获取所有索引信息
     * @returns {Record<string, Record<string, IndexDefinition>>} - 索引定义
     */
    getIndexes(): Record<string, Record<string, IndexDefinition>>;
    /**
     * 检查指定路径是否有索引定义
     * @param {string} key - 集合路径
     * @returns {boolean} - 是否有索引
     */
    private _hasIndexDefinition;
    /**
     * 检查指定路径的指定字段是否有索引
     * @param {string} key - 集合路径
     * @param {string} field - 字段名
     * @returns {boolean} - 是否有索引
     */
    private _hasIndexOnField;
    /**
     * 重建所有索引
     */
    private _rebuildAllIndexes;
    /**
     * 重建指定路径的所有索引
     * @param {string} key - 集合路径
     */
    private _rebuildIndexesForKey;
    /**
     * 构建索引
     * @param {string} key - 集合路径
     * @param {IndexDefinition} indexDef - 索引定义
     */
    private _buildIndex;
    /**
     * 根据对象查找索引位置
     * @param {string} key - 集合路径
     * @param {object} obj - 查询对象
     * @returns {number} - 找到的索引位置，-1表示未找到
     */
    private _findIndexedItemPosition;
    /**
     * 根据字段和值获取数组中的项索引
     * @param {string} key - 集合路径
     * @param {string} field - 字段名
     * @param {any} value - 字段值
     * @returns {number} - 找到的索引位置，-1表示未找到
     */
    private _getItemIndexByField;
    /**
     * 根据字段和值获取数组中的多个项索引
     * @param {string} key - 集合路径
     * @param {string} field - 字段名
     * @param {any} value - 字段值
     * @returns {number[]} - 找到的索引位置数组
     */
    private _getItemIndexesByField;
    /**
     * 复杂查询操作，支持排序、分页、聚合等
     * @param {string} key - 集合路径
     * @param {QueryOptions} options - 查询选项
     * @returns {QueryResult} - 查询结果
     */
    query<T = any>(key: string, options?: QueryOptions<T>): QueryResult<T>;
    /**
     * 应用过滤条件
     * @param {string} key - 集合路径
     * @param {T[]} data - 数据数组
     * @param {PredicateFunction<T> | Record<string, any>} where - 过滤条件
     * @returns {{data: T[], usedIndex: boolean}} - 过滤结果
     */
    private _applyFilter;
    /**
     * 检查项是否匹配条件
     * @param {any} item - 数据项
     * @param {Record<string, any>} conditions - 条件对象
     * @returns {boolean} - 是否匹配
     */
    private _matchesConditions;
    /**
     * 应用排序
     * @param {T[]} data - 数据数组
     * @param {SortOption | SortOption[]} sort - 排序选项
     * @returns {T[]} - 排序后的数据
     */
    private _applySort;
    /**
     * 应用分页
     * @param {T[]} data - 数据数组
     * @param {PaginationOption} pagination - 分页选项
     * @returns {PaginationResult<T>} - 分页结果
     */
    private _applyPagination;
    /**
     * 应用字段选择
     * @param {T[]} data - 数据数组
     * @param {string[]} select - 选择的字段
     * @returns {T[]} - 选择后的数据
     */
    private _applySelect;
    /**
     * 应用聚合操作
     * @param {any[]} data - 数据数组
     * @param {AggregationOption[]} aggregations - 聚合选项
     * @returns {AggregationResult[]} - 聚合结果
     */
    private _applyAggregation;
    /**
     * 快速排序查询（优化版本）
     * @param {string} key - 集合路径
     * @param {SortOption | SortOption[]} sort - 排序选项
     * @param {number} [limit] - 限制返回数量
     * @returns {T[]} - 排序后的数据
     */
    orderBy<T = any>(key: string, sort: SortOption | SortOption[], limit?: number): T[];
    /**
     * 快速分页查询
     * @param {string} key - 集合路径
     * @param {number} page - 页码（从1开始）
     * @param {number} pageSize - 每页数量
     * @param {PredicateFunction<T> | Record<string, any>} [where] - 过滤条件
     * @returns {PaginationResult<T>} - 分页结果
     */
    paginate<T = any>(key: string, page: number, pageSize: number, where?: PredicateFunction<T> | Record<string, any>): PaginationResult<T>;
    /**
     * 聚合查询
     * @param {string} key - 集合路径
     * @param {AggregationOption[]} aggregations - 聚合选项
     * @param {PredicateFunction<T> | Record<string, any>} [where] - 过滤条件
     * @returns {AggregationResult[]} - 聚合结果
     */
    aggregate<T = any>(key: string, aggregations: AggregationOption[], where?: PredicateFunction<T> | Record<string, any>): AggregationResult[];
    /**
     * 统计查询
     * @param {string} key - 集合路径
     * @param {PredicateFunction<T> | Record<string, any>} [where] - 过滤条件
     * @returns {number} - 统计数量
     */
    count<T = any>(key: string, where?: PredicateFunction<T> | Record<string, any>): number;
    /**
     * 去重查询
     * @param {string} key - 集合路径
     * @param {string} field - 去重字段
     * @returns {any[]} - 去重后的值数组
     */
    distinct(key: string, field: string): any[];
}
export default NodedbJson;
