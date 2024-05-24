## nodedb-json

**nodedb-json** is a lightweight JSON file database tool designed for Electron applications. It provides an easy-to-use API for setting, reading, querying, updating, and deleting data stored in JSON files.

### Features

- **Simple and Intuitive**: Easy-to-use API for seamless interaction with JSON files.
- **Persistent Storage**: Data is stored persistently in JSON files, perfect for Electron applications.
- **Flexible Querying**: Supports querying and filtering of collections.
- **Lightweight**: Minimal dependencies, ensuring fast performance.

### Installation

```bash
npm install nodedb-json
```

### Usage

```javascript
const NodedbJson = require('nodedb-json');

const db = new NodedbJson('db.json');

db.set('user.name', 'Alice')
  .set('user.age', 25);

console.log(db.get('user')); // { name: 'Alice', age: 25 }
```

### API

#### `set(key, value)`
Sets a value at the specified key.

#### `get(key)`
Gets the value at the specified key.

#### `has(key)`
Checks if the specified key exists.

#### `update(key, updater)`
Updates the value at the specified key using the provided updater function.

#### `delete(key)`
Deletes the specified key and its value.

#### `find(collection, predicate)`
Finds an element in a collection that matches the predicate.

#### `filter(collection, predicate)`
Filters elements in a collection based on the predicate.

### License

MIT