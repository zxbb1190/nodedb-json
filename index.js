const fs = require("fs");
const _ = require("lodash");

/**
 * A class to manage JSON-based database operations.
 */
class NodedbJson {
     /**
     * Creates an instance of NodedbJson.
     * @param {string} filePath - The path to the JSON file.
     */
    constructor(filePath) {
        this.filePath = filePath;
        this.data = this.readJSONFile();
    }

    /**
     * Reads the JSON file.
     * @returns {object} - The parsed JSON data.
     */
    readJSONFile() {
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify({}), "utf-8");
        }
        const fileData = fs.readFileSync(this.filePath, "utf-8");
        return JSON.parse(fileData);
    }

     /**
     * Writes the JSON data to the file.
     */
    writeJSONFile() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
    }

    /**
     * Sets a value in the JSON data.
     * @param {string} key - The key to set.
     * @param {any} value - The value to set.
     * @returns {NodedbJson} - The instance of the database for chaining.
     */
    set(key, value) {
        _.set(this.data, key, value);
        this.writeJSONFile();
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
            const item = _.find(data, predicateOrUpdater);
            if (item) {
                _.merge(item, updater);
                this.writeJSONFile();
            } else {
                throw new Error(`No item found matching the predicate.`);
            }
        } else if (_.isObject(data)) {
            _.update(this.data, key, predicateOrUpdater);
            this.writeJSONFile();
        } else {
            throw new Error(`Key "${key}" does not reference a collection or array.`);
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
        if (Array.isArray(data)) {
            if (typeof predicateOrKeys === 'function') {
                _.remove(data, predicateOrKeys);
            } else if (Array.isArray(predicateOrKeys)) {
                _.remove(data, item => predicateOrKeys.includes(item[field]));
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
        this.writeJSONFile();
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
    filter(key, predicate) {
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
    push(key, value) {
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
                this.writeJSONFile();
            } else {
                throw new Error(`Key "${key}" is not an array.`);
            }
        }
        return this;
    }
}

// Conditional export for ES6 modules
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = NodedbJson;
} else {
    window.NodedbJson = NodedbJson;
}
