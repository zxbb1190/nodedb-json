## nodedb-json

**nodedb-json** is a lightweight JSON file database tool designed for Electron applications. It provides an easy-to-use API for setting, reading, querying, updating, and deleting data stored in JSON files.

### Features

-   **Simple and Intuitive**: Easy-to-use API for seamless interaction with JSON files.
-   **Persistent Storage**: Data is stored persistently in JSON files, perfect for Electron applications.
-   **Flexible Querying**: Supports querying and filtering of collections.
-   **Array Operations**: Provides robust methods for manipulating arrays, including adding, removing, and updating elements.
-   **Lightweight**: Minimal dependencies, ensuring fast performance.

### Installation

```bash
npm install nodedb-json
```

### Usage

### Initialization

```javascript
const NodedbJson = require("nodedbjson");
const db = new NodedbJson("db.json");
```

### Basic Operations

#### Set

```javascript
db.set("key", "value");
```

#### Get

```javascript
const value = db.get("key");
```

#### Update

```javascript
// Update an object
db.update("key", { newField: "newValue" });

// Update an array item
db.update("arrayKey", (item) => item.id === 1, { name: "Updated Name" });
```

#### Delete

```javascript
// Delete a key
db.delete("key");

// Delete array items using a predicate
db.delete("arrayKey", (item) => item.id === 1);

// Batch delete array items by specified field
db.delete("arrayKey", [1, 3]); // Deletes items with id 1 and 3
db.delete("arrayKey", ["Alice", "Charlie"], "name"); // Deletes items with name 'Alice' and 'Charlie'
```

#### Push

```javascript
db.push("users", { name: "Bob", age: 30 }).push("users", { name: "Charlie", age: 35 });
db.push("users", [
    { name: "Bob", age: 30 },
    { name: "Charlie", age: 35 },
]);
```

### Advanced Operations

#### Find

```javascript
const item = db.find("arrayKey", (item) => item.id === 2);
```

#### Filter

```javascript
const items = db.filter("arrayKey", (item) => item.isActive);
```

### Changelog

#### v0.1.4
- Added support for batch deleting array items by specified field in the delete method.

#### v0.1.3

-   Added support for pushing a value or an array of values to an array key using the push method.

### API

#### `set(key, value)`

Sets a value at the specified key.

#### `get(key)`

Gets the value at the specified key.

#### `has(key)`

Checks if the specified key exists.

#### `update(key, predicateOrUpdater, [updater])`

-   If key references an object:
    -   Updates the value at the specified key using the provided updater function.
-   If key references an array:
    -   Finds an element in the array that matches the predicate and updates it using the provided updater object.

#### `delete(key, [predicateOrKeys], [field='id'])`

-   If key references an object:
    -   Deletes the specified key and its value.
-   If key references an array and predicate is provided:
    -   Removes elements from the array at the specified key that match the predicate.
-   If key references an array and an array of keys is provided:
    -   Removes elements from the array that match any of the keys in the provided array, based on the specified field.

#### `find(collection, predicate)`

Finds an element in the collection or array at the specified key that matches the predicate.

#### `filter(collection, predicate)`

Filters elements in the collection or array at the specified key based on the predicate.

#### `push(key, value)`

Pushes a value or an array of values to the array at the specified key. If the key does not exist, it creates the key and sets its value to the provided array.

### License

MIT

### Contact

For any questions or feedback, please contact me at [douyaj33@gmail.com](mailto:douyaj33@gmail.com).

For issues and support, visit the [GitHub Issues page](https://github.com/zxbb1190/nodedb-json/issues).
