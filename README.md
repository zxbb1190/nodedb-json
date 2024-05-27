## nodedb-json

**nodedb-json** is a lightweight JSON file database tool designed for Electron applications. It provides an easy-to-use API for setting, reading, querying, updating, and deleting data stored in JSON files.

### Features

- **Simple and Intuitive**: Easy-to-use API for seamless interaction with JSON files.
- **Persistent Storage**: Data is stored persistently in JSON files, perfect for Electron applications.
- **Flexible Querying**: Supports querying and filtering of collections.
- **Array Operations**: Provides robust methods for manipulating arrays, including adding, removing, and updating elements.
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

// Array operations
db.set('users', [])
  .push('users', { name: 'Bob', age: 30 })
  .push('users', { name: 'Charlie', age: 35 });

console.log(db.get('users')); // [{ name: 'Bob', age: 30 }, { name: 'Charlie', age: 35 }]

db.delete('users', user => user.name === 'Bob');
console.log(db.get('users')); // [{ name: 'Charlie', age: 35 }]

db.update('users', user => user.name === 'Charlie', { age: 36 });
console.log(db.get('users')); // [{ name: 'Charlie', age: 36 }]

console.log(db.find('users', user => user.name === 'Charlie')); // { name: 'Charlie', age: 36 }
console.log(db.filter('users', user => user.age > 30)); // [{ name: 'Charlie', age: 36 }]
```

### Changelog
#### Version 1.2.0
- Added support for pushing a value or an array of values to an array key using the push method.

### API

#### `set(key, value)`
Sets a value at the specified key.

#### `get(key)`
Gets the value at the specified key.

#### `has(key)`
Checks if the specified key exists.

#### `update(key, updater)`
- If key references an object:
  - Updates the value at the specified key using the provided updater function.
- If key references an array:
  - Finds an element in the array that matches the predicate and updates it using the provided updater object.

#### `delete(key)`
- If key references an object:
  - Deletes the specified key and its value.
- If key references an array and predicate is provided:
  - Removes elements from the array at the specified key that match the predicate.

#### `find(collection, predicate)`
Finds an element in the collection or array at the specified key that matches the predicate.

#### `filter(collection, predicate)`
Filters elements in the collection or array at the specified key based on the predicate.

#### `push(key, value)`
Pushes a value or an array of values to the array at the specified key. If the key does not exist, it creates the key and sets its value to the provided array.

### License

MIT

### Contact
For any questions or feedback, please contact me at  [douyaj33@gmail.com](mailto:douyaj33@gmail.com).

For issues and support, visit the [GitHub Issues page](https://github.com/zxbb1190/nodedb-json/issues).




