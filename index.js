const fs = require("fs");
const path = require("path");
const _ = require("lodash");

class NodedbJson {
    constructor(filePath) {
        this.filePath = filePath;
        this.data = this.readJSONFile();
    }

    readJSONFile() {
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify({}), "utf-8");
        }
        const fileData = fs.readFileSync(this.filePath, "utf-8");
        return JSON.parse(fileData);
    }

    writeJSONFile() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
    }

    set(key, value) {
        _.set(this.data, key, value);
        this.writeJSONFile();
        return this;
    }

    get(key) {
        return _.get(this.data, key);
    }

    has(key) {
        return _.has(this.data, key);
    }

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

module.exports = NodedbJson;
