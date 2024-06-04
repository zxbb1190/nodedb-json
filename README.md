## nodedb-json

**nodedb-json** is a lightweight JSON file database tool designed for Node.js. It provides an easy-to-use API for setting, reading, querying, updating, and deleting data stored in JSON files. Supports both CommonJS and ES6 module syntax.

### Features

-   **Simple and Intuitive**: Easy-to-use API for seamless interaction with JSON files.
-   **Persistent Storage**: Data is stored persistently in JSON files, perfect for Node.js.
-   **Flexible Querying**: Supports querying and filtering of collections.
-   **Array Operations**: Provides robust methods for manipulating arrays, including adding, removing, and updating elements.
-   **Lightweight**: Minimal dependencies, ensuring fast performance.

### Installation

```bash
npm install nodedb-json
```

### Usage

#### CommonJS

```javascript
const NodedbJson = require('nodedb-json');
const db = new NodedbJson('path/to/db.json');

db.set('name', 'John Doe');
console.log(db.get('name')); // Outputs: John Doe
```

#### ES6

```javascript
import NodedbJson from 'nodedb-json';
const db = new NodedbJson('path/to/db.json');

db.set('name', 'John Doe');
console.log(db.get('name')); // Outputs: John Doe
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

## Changelog

### [1.0.0] - 2024-05-27
- Major version update.
- Added support for ES6 module syntax.
- Enhanced `delete` method to support batch deletion by specifying a field.
- Added JSDoc comments for all methods.

### [0.1.4] - 2024-05-20
- Initial release with basic CRUD operations.
- Support for array operations with `push`, `find`, and `filter`.

##

### API Documentation

#### `set(key, value)`
Sets a value in the JSON data.
- **Parameters:**
  - `key` (string): The key to set.
  - `value` (any): The value to set.
- **Returns:** `NodedbJson` - The instance of the database for chaining.

#### `get(key)`
Gets a value from the JSON data.
- **Parameters:**
  - `key` (string): The key to get.
- **Returns:** `any` - The value.

#### `has(key)`
Checks if a key exists in the JSON data.
- **Parameters:**
  - `key` (string): The key to check.
- **Returns:** `boolean` - True if the key exists, otherwise false.

#### `update(key, predicateOrUpdater, updater)`
Updates a value in the JSON data.
- **Parameters:**
  - `key` (string): The key to update.
  - `predicateOrUpdater` (function|object): The predicate function or updater object.
  - `updater` (object) [optional]: The updater object if a predicate function is provided.
- **Returns:** `NodedbJson` - The instance of the database for chaining.

#### `delete(key, predicateOrKeys, field)`
Deletes a value from the JSON data.
- **Parameters:**
  - `key` (string): The key to delete.
  - `predicateOrKeys` (function|string[]) [optional]: The predicate function or array of keys to delete.
  - `field` (string) [optional]: The field to match for array deletion. Default is 'id'.
- **Returns:** `NodedbJson` - The instance of the database for chaining.

#### `find(key, predicate)`
Finds a value in the JSON data.
- **Parameters:**
  - `key` (string): The key to find.
  - `predicate` (function): The predicate function to match.
- **Returns:** `any` - The found value.

#### `filter(key, predicate)`
Filters values in the JSON data.
- **Parameters:**
  - `key` (string): The key to filter.
  - `predicate` (function): The predicate function to match.
- **Returns:** `any[]` - The filtered values.

#### `push(key, value)`
Pushes a value into an array in the JSON data.
- **Parameters:**
  - `key` (string): The key to push to.
  - `value` (any|any[]): The value or values to push.
- **Returns:** `NodedbJson` - The instance of the database for chaining.

### License

MIT 

### Contact

For any questions or feedback, please contact me at [douyaj33@gmail.com](mailto:douyaj33@gmail.com).

For issues and support, visit the [GitHub Issues page](https://github.com/zxbb1190/nodedb-json/issues).
