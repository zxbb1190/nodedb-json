import * as fs from 'fs';
import * as _ from 'lodash';
import { AnyValue, PredicateFunction, UpdaterObject, DbOptions } from './types';

/**
 * A class to manage JSON-based database operations.
 */
class NodedbJson {
  private filePath: string;
  private data: Record<string, any>;
  private options: DbOptions;
  private _pendingChanges: number = 0;
  
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
      ...options
    };
    this.data = this.readJSONFile();
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
    _.set(this.data, key, value);
    this._pendingChanges++;
    
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
      const item = _.find(data, predicateOrUpdater as PredicateFunction<T>);
      if (item && updater) {
        _.merge(item, updater);
        this._pendingChanges++;
      } else if (!item) {
        throw new Error(`No item found matching the predicate.`);
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
    if (Array.isArray(data)) {
      if (typeof predicateOrKeys === 'function') {
        _.remove(data, predicateOrKeys as PredicateFunction<T>);
      } else if (Array.isArray(predicateOrKeys)) {
        _.remove(data, (item: any) => predicateOrKeys.includes(item[field]));
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
}

// 导出类
export default NodedbJson;

// 为了兼容 CommonJS 导出
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = NodedbJson;
} 