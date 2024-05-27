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

    delete(key, predicate) {
      const data = this.get(key);
      if (Array.isArray(data) && typeof predicate === 'function') {
        _.remove(data, predicate);
      } else if (this.has(key)) {
        _.unset(this.data, key);
      } else {
        throw new Error(`Key "${key}" does not exist or predicate is not provided for array.`);
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
      const array = this.get(key);
      if (Array.isArray(array)) {
        array.push(value);
        this.writeJSONFile();
      } else {
        throw new Error(`Key "${key}" is not an array.`);
      }
      return this;
    }
}

module.exports = NodedbJson;
