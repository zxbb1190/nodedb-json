const fs = require('fs');
const path = require('path');
const _ = require('lodash');

class NodedbJson {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = this.readJSONFile();
  }

  readJSONFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify({}), 'utf-8');
    }
    const fileData = fs.readFileSync(this.filePath, 'utf-8');
    return JSON.parse(fileData);
  }

  writeJSONFile() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
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

  update(key, updater) {
    if (this.has(key)) {
      _.update(this.data, key, updater);
      this.writeJSONFile();
    } else {
      throw new Error(`Key "${key}" does not exist.`);
    }
    return this;
  }

  delete(key) {
    if (this.has(key)) {
      _.unset(this.data, key);
      this.writeJSONFile();
    } else {
      throw new Error(`Key "${key}" does not exist.`);
    }
    return this;
  }

  find(collection, predicate) {
    return _.find(this.get(collection), predicate);
  }

  filter(collection, predicate) {
    return _.filter(this.get(collection), predicate);
  }
}

module.exports = NodedbJson;
