"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const _ = __importStar(require("lodash"));
/**
 * A class to manage JSON-based database operations.
 */
class NodedbJson {
    /**
     * Creates an instance of NodedbJson.
     * @param {string} filePath - The path to the JSON file.
     * @param {DbOptions} [options] - Database options.
     */
    constructor(filePath, options = {}) {
        this._pendingChanges = 0;
        this._indexes = {};
        this._indexDefinitions = {};
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
    readJSONFile() {
        if (!fs.existsSync(this.filePath)) {
            if (this.options.createIfNotExists) {
                fs.writeFileSync(this.filePath, JSON.stringify(this.options.defaultValue || {}), "utf-8");
            }
            else {
                throw new Error(`Database file does not exist: ${this.filePath}`);
            }
        }
        const fileData = fs.readFileSync(this.filePath, "utf-8");
        return JSON.parse(fileData);
    }
    /**
     * Writes the JSON data to the file.
     */
    writeJSONFile() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
        this._pendingChanges = 0;
    }
    /**
     * Manually save changes to file.
     * @returns {NodedbJson} - The instance of the database for chaining.
     */
    save() {
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
    set(key, value) {
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
    get(key) {
        return _.get(this.data, key);
    }
    /**
     * Checks if a key exists in the JSON data.
     * @param {string} key - The key to check.
     * @returns {boolean} - True if the key exists, otherwise false.
     */
    has(key) {
        return _.has(this.data, key);
    }
    /**
     * Updates a value in the JSON data.
     * @param {string} key - The key to update.
     * @param {function|object} predicateOrUpdater - The predicate function or updater object.
     * @param {object} [updater] - The updater object if a predicate function is provided.
     * @returns {NodedbJson} - The instance of the database for chaining.
     */
    update(key, predicateOrUpdater, updater) {
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
                }
                else {
                    throw new Error(`No item found matching the predicate.`);
                }
            }
            else {
                // 常规查找
                const item = _.find(data, predicateOrUpdater);
                if (item && updater) {
                    _.merge(item, updater);
                    this._pendingChanges++;
                    // 如果有索引，需要更新
                    if (this.options.enableIndexing && this._hasIndexDefinition(key)) {
                        this._rebuildIndexesForKey(key);
                    }
                }
                else if (!item) {
                    throw new Error(`No item found matching the predicate.`);
                }
            }
        }
        else if (_.isObject(data)) {
            _.update(this.data, key, predicateOrUpdater);
            this._pendingChanges++;
        }
        else {
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
    delete(key, predicateOrKeys, field = 'id') {
        const data = this.get(key);
        const hasIndex = this.options.enableIndexing && this._hasIndexDefinition(key);
        if (Array.isArray(data)) {
            if (typeof predicateOrKeys === 'function') {
                _.remove(data, predicateOrKeys);
            }
            else if (Array.isArray(predicateOrKeys)) {
                // 如果有索引，尝试使用索引删除
                if (hasIndex && this._hasIndexOnField(key, field)) {
                    for (const fieldValue of predicateOrKeys) {
                        const index = this._getItemIndexByField(key, field, fieldValue);
                        if (index !== -1) {
                            data.splice(index, 1);
                        }
                    }
                }
                else {
                    _.remove(data, (item) => predicateOrKeys.includes(item[field]));
                }
            }
            else {
                throw new Error(`Predicate or keys array must be provided for array deletion.`);
            }
        }
        else if (this.has(key)) {
            if (Array.isArray(predicateOrKeys)) {
                predicateOrKeys.forEach(itemKey => {
                    _.unset(this.data[key], itemKey);
                });
            }
            else {
                _.unset(this.data, key);
            }
        }
        else {
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
    find(key, predicate) {
        const data = this.get(key);
        if (Array.isArray(data)) {
            return _.find(data, predicate);
        }
        else if (_.isObject(data)) {
            return _.find(Object.values(data), predicate);
        }
        else {
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
    findByField(key, field, value) {
        const data = this.get(key);
        if (!Array.isArray(data)) {
            throw new Error(`Key "${key}" does not reference an array.`);
        }
        // 使用索引进行查找
        if (this.options.enableIndexing && this._hasIndexOnField(key, field)) {
            const index = this._getItemIndexByField(key, field, value);
            return index !== -1 ? data[index] : undefined;
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
    filter(key, predicate) {
        const data = this.get(key);
        if (Array.isArray(data)) {
            return _.filter(data, predicate);
        }
        else if (_.isObject(data)) {
            return _.filter(Object.values(data), predicate);
        }
        else {
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
    filterByField(key, field, values) {
        const data = this.get(key);
        if (!Array.isArray(data)) {
            throw new Error(`Key "${key}" does not reference an array.`);
        }
        // 使用索引进行过滤
        if (this.options.enableIndexing && this._hasIndexOnField(key, field)) {
            const result = [];
            for (const value of values) {
                const indexes = this._getItemIndexesByField(key, field, value);
                for (const index of indexes) {
                    result.push(data[index]);
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
    push(key, value) {
        if (!this.has(key)) {
            if (Array.isArray(value)) {
                this.set(key, value);
            }
            else {
                this.set(key, [value]);
            }
        }
        else {
            const array = this.get(key);
            if (Array.isArray(array)) {
                if (Array.isArray(value)) {
                    array.push(...value);
                }
                else {
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
            }
            else {
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
    batch(operations) {
        const originalAutoSave = this.options.autoSave;
        this.options.autoSave = false;
        try {
            operations.forEach(op => {
                const { method, args } = op;
                if (typeof this[method] === 'function') {
                    this[method].apply(this, args);
                }
            });
            this.writeJSONFile();
        }
        finally {
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
    createIndex(key, indexDefinition) {
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
    dropIndex(key, field) {
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
    getIndexes() {
        return _.cloneDeep(this._indexDefinitions);
    }
    /**
     * 检查指定路径是否有索引定义
     * @param {string} key - 集合路径
     * @returns {boolean} - 是否有索引
     */
    _hasIndexDefinition(key) {
        return !!this._indexDefinitions[key] && Object.keys(this._indexDefinitions[key]).length > 0;
    }
    /**
     * 检查指定路径的指定字段是否有索引
     * @param {string} key - 集合路径
     * @param {string} field - 字段名
     * @returns {boolean} - 是否有索引
     */
    _hasIndexOnField(key, field) {
        return !!this._indexDefinitions[key] && !!this._indexDefinitions[key][field];
    }
    /**
     * 重建所有索引
     */
    _rebuildAllIndexes() {
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
    _rebuildIndexesForKey(key) {
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
    _buildIndex(key, indexDef) {
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
            }
            else {
                // 多值索引
                if (!this._indexes[indexKey][strValue]) {
                    this._indexes[indexKey][strValue] = [];
                }
                this._indexes[indexKey][strValue].push(index);
            }
        });
    }
    /**
     * 根据对象查找索引位置
     * @param {string} key - 集合路径
     * @param {object} obj - 查询对象
     * @returns {number} - 找到的索引位置，-1表示未找到
     */
    _findIndexedItemPosition(key, obj) {
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
    _getItemIndexByField(key, field, value) {
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
    _getItemIndexesByField(key, field, value) {
        const indexKey = `${key}:${field}`;
        const strValue = String(value);
        if (!this._indexes[indexKey] || this._indexes[indexKey][strValue] === undefined) {
            return [];
        }
        const indexData = this._indexes[indexKey][strValue];
        return typeof indexData === 'number' ? [indexData] : indexData;
    }
}
// 导出类
exports.default = NodedbJson;
// 为了兼容 CommonJS 导出
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = NodedbJson;
}
//# sourceMappingURL=index.js.map