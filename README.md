## nodedb-json

**nodedb-json** is a lightweight JSON file database tool designed for Node.js. It provides an easy-to-use API for setting, reading, querying, updating, and deleting data stored in JSON files. Supports both CommonJS and ES6 module syntax, as well as TypeScript.

### Features

-   **Simple and Intuitive**: Easy-to-use API for seamless interaction with JSON files.
-   **Persistent Storage**: Data is stored persistently in JSON files, perfect for Node.js.
-   **Flexible Querying**: Supports querying and filtering of collections.
-   **Array Operations**: Provides robust methods for manipulating arrays, including adding, removing, and updating elements.
-   **Lightweight**: Minimal dependencies, ensuring fast performance.
-   **TypeScript Support**: Full TypeScript support with type definitions.
-   **Batch Operations**: Support for executing multiple operations in batch.
-   **Indexing**: Supports creating indexes on array fields for faster lookups.

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

#### TypeScript

```typescript
import NodedbJson from 'nodedb-json';

// Define your data types
interface User {
  id: number;
  name: string;
  age: number;
}

// Create database with options
const db = new NodedbJson<User>('path/to/db.json', {
  autoSave: true,
  createIfNotExists: true,
  defaultValue: { users: [] }
});

// Type-safe operations
db.push('users', { id: 1, name: 'John', age: 30 });
const user = db.find<User>('users', user => user.id === 1);
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

#### Batch Operations

```javascript
db.batch([
  { method: "set", args: ["config.theme", "dark"] },
  { method: "set", args: ["config.language", "zh-CN"] },
  { method: "push", args: ["logs", { time: new Date().toISOString(), action: "配置更新" }] }
]);
```

#### Manual Save

```javascript
// Configure auto-save
const db = new NodedbJson('path/to/db.json', { autoSave: false });

// Make changes
db.set("key1", "value1");
db.set("key2", "value2");

// Manually save when ready
db.save();
```

### Indexing

Indexing can significantly improve lookup performance for large datasets:

```javascript
// Create a unique index on the 'id' field
db.createIndex("users", { field: "id", type: "unique" });

// Create a multi-value index on the 'age' field
db.createIndex("users", { field: "age", type: "multi" });

// Find using index
const user = db.findByField("users", "id", 1);

// Filter using index
const adults = db.filterByField("users", "age", [30, 40, 50]);

// Drop an index when no longer needed
db.dropIndex("users", "age");
```

## Changelog

### [1.3.0] - 2025-06-03
- **Major Feature Update: Complex Query Support**
  - Added `query()` method with comprehensive query operations
  - Support for multi-field sorting
  - Support for pagination queries
  - Support for aggregation operations: count, sum, avg, min, max, group
  - Support for field selection/projection
  - Added convenient query methods: `orderBy()`, `paginate()`, `count()`, `aggregate()`, `distinct()`
  - Intelligent index utilization with automatic query optimization
  - Detailed query statistics (execution time, index usage, etc.)
- **Performance Optimizations**
  - Query operations with index acceleration support
  - Lazy evaluation for optimized large dataset processing
  - Execution time monitoring and performance metrics
- **Developer Experience Improvements**
  - Complete TypeScript type support
  - Rich documentation and examples
  - Added `npm run example:query` demonstration script

### [1.2.0] - 2025-05-26
- Added indexing support for faster lookups
- Added `findByField` and `filterByField` methods for index-based queries
- Performance improvements for large datasets

### [1.1.0] - 2025-05-13
- Added TypeScript support with type definitions
- Added batch operations
- Added configuration options
- Added manual save functionality
- Improved error handling

### [1.0.0] - 2024-05-27
- Major version update.
- Added support for ES6 module syntax.
- Enhanced `delete` method to support batch deletion by specifying a field.
- Added JSDoc comments for all methods.

### [0.1.4] - 2024-05-20
- Initial release with basic CRUD operations.
- Support for array operations with `push`, `find`, and `filter`.

## API Documentation

### Constructor Options

```typescript
interface DbOptions {
  autoSave?: boolean;        // Auto save after each operation (default: true)
  createIfNotExists?: boolean; // Create file if it doesn't exist (default: true)
  defaultValue?: Record<string, any>; // Default value for new database
  enableIndexing?: boolean;   // Enable indexing functionality (default: true)
  autoIndex?: boolean;        // Auto rebuild indexes on start (default: true)
}
```

### Basic Methods

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

### Advanced Methods

#### `batch(operations)`
Executes multiple operations in batch.
- **Parameters:**
  - `operations` (Array<{method: string, args: any[]}>): Array of operations to execute.
- **Returns:** `NodedbJson` - The instance of the database for chaining.

#### `save()`
Manually save changes to file.
- **Returns:** `NodedbJson` - The instance of the database for chaining.

### Indexing Methods

#### `createIndex(key, indexDefinition)`
Creates an index on a field for faster lookups.
- **Parameters:**
  - `key` (string): The collection path to index.
  - `indexDefinition` (IndexDefinition): The index definition with field and type.
- **Returns:** `NodedbJson` - The instance of the database for chaining.

#### `findByField(key, field, value)`
Finds a value by field using an index if available.
- **Parameters:**
  - `key` (string): The key to find.
  - `field` (string): The field to match.
  - `value` (any): The value to match.
- **Returns:** `any` - The found value.

#### `filterByField(key, field, values)`
Filters values by field and possible values using an index if available.
- **Parameters:**
  - `key` (string): The key to filter.
  - `field` (string): The field to match.
  - `values` (any[]): The values to match.
- **Returns:** `any[]` - The filtered values.

#### `dropIndex(key, field)`
Removes an index.
- **Parameters:**
  - `key` (string): The collection path.
  - `field` (string): The field name.
- **Returns:** `NodedbJson` - The instance of the database for chaining.

#### `getIndexes()`
Gets all index definitions.
- **Returns:** `Record<string, Record<string, IndexDefinition>>` - The index definitions.

## Complex Query Operations

NodeDB-JSON supports powerful complex query operations including sorting, pagination, aggregation, and more. All query operations can leverage indexes for optimal performance.

### Core Query Method

#### `query(key, options)`
Executes a complex query with multiple options.
- **Parameters:**
  - `key` (string): The collection path to query.
  - `options` (QueryOptions): Query configuration object.
- **Returns:** `QueryResult` - Comprehensive query results with data, pagination, aggregations, and statistics.

### Query Options

```typescript
interface QueryOptions<T = any> {
  where?: PredicateFunction<T> | Record<string, any>;  // Filter conditions
  sort?: SortOption | SortOption[];                    // Sorting options
  pagination?: PaginationOption;                       // Pagination settings
  aggregation?: AggregationOption[];                   // Aggregation operations
  select?: string[];                                   // Field selection (projection)
  limit?: number;                                      // Limit results
  skip?: number;                                       // Skip records
}
```

### Basic Examples

#### Filtering and Sorting

```javascript
// Find tech department employees, sorted by salary (descending)
const result = db.query('users', {
  where: { department: '技术部' },
  sort: { field: 'salary', direction: 'desc' }
});

console.log('Found:', result.data.length, 'records');
console.log('Execution time:', result.stats.executionTime, 'ms');
console.log('Used index:', result.stats.usedIndex);
```

#### Multi-field Sorting

```javascript
// Sort by department (ascending), then by salary (descending)
const result = db.query('users', {
  sort: [
    { field: 'department', direction: 'asc' },
    { field: 'salary', direction: 'desc' }
  ]
});
```

#### Pagination

```javascript
// Get page 2 with 5 records per page
const result = db.query('users', {
  sort: { field: 'salary', direction: 'desc' },
  pagination: { page: 2, pageSize: 5 }
});

console.log('Current page:', result.pagination.currentPage);
console.log('Total pages:', result.pagination.totalPages);
console.log('Has next page:', result.pagination.hasNext);
```

#### Field Selection (Projection)

```javascript
// Select only specific fields
const result = db.query('users', {
  where: { department: '技术部' },
  select: ['name', 'salary', 'age'],
  sort: { field: 'salary', direction: 'desc' }
});
```

### Aggregation Operations

#### Basic Aggregations

```javascript
// Get various statistics
const result = db.query('users', {
  aggregation: [
    { type: 'count' },                    // Count records
    { type: 'avg', field: 'salary' },     // Average salary
    { type: 'sum', field: 'salary' },     // Total salary
    { type: 'min', field: 'salary' },     // Minimum salary
    { type: 'max', field: 'salary' },     // Maximum salary
  ]
});

result.aggregations?.forEach(agg => {
  console.log(`${agg.type}:`, agg.value);
});
```

#### Group By

```javascript
// Group by department
const result = db.query('users', {
  aggregation: [
    { type: 'group', groupBy: 'department' }
  ]
});

const groups = result.aggregations?.[0]?.value as Record<string, any[]>;
Object.entries(groups).forEach(([dept, users]) => {
  console.log(`${dept}: ${users.length} employees`);
});
```

### Complex Query Example

```javascript
// Complex query combining multiple features
const result = db.query('users', {
  where: user => user.department === '技术部' && user.salary > 12000,
  sort: { field: 'age', direction: 'asc' },
  pagination: { page: 1, pageSize: 10 },
  select: ['name', 'age', 'salary'],
  aggregation: [
    { type: 'count' },
    { type: 'avg', field: 'salary' }
  ]
});

console.log('Results:', result.data);
console.log('Total matching records:', result.aggregations?.[0]?.value);
console.log('Average salary:', result.aggregations?.[1]?.value);
```

### Convenience Methods

For common operations, convenience methods are available:

#### `orderBy(key, sort, limit?)`
Quick sorting with optional limit.

```javascript
// Get top 5 highest paid employees
const topEarners = db.orderBy('users', 
  { field: 'salary', direction: 'desc' }, 
  5
);
```

#### `paginate(key, page, pageSize, where?)`
Quick pagination with optional filtering.

```javascript
// Get first page of sales department
const salesPage = db.paginate('users', 1, 10, { department: '销售部' });
```

#### `count(key, where?)`
Count records with optional filtering.

```javascript
// Count tech department employees
const techCount = db.count('users', { department: '技术部' });
```

#### `aggregate(key, aggregations, where?)`
Execute aggregations with optional filtering.

```javascript
// Get tech department salary statistics
const techStats = db.aggregate('users', [
  { type: 'count' },
  { type: 'avg', field: 'salary' },
  { type: 'max', field: 'salary' }
], { department: '技术部' });
```

#### `distinct(key, field)`
Get unique values for a field.

```javascript
// Get all unique departments
const departments = db.distinct('users', 'department');
console.log('Departments:', departments);
```

### Performance Features

- **Index-aware filtering**: Automatically uses indexes when available for object-based where conditions
- **Optimized sorting**: Leverages lodash's efficient orderBy implementation
- **Lazy evaluation**: Pagination and limits are applied efficiently
- **Execution statistics**: Get detailed performance metrics for each query

### Query Result Structure

```typescript
interface QueryResult<T> {
  data: T[];                           // Query results
  pagination?: PaginationInfo;         // Pagination details (if used)
  aggregations?: AggregationResult[];  // Aggregation results (if used)
  stats: {
    totalRecords: number;              // Total records before filtering
    filteredRecords: number;           // Records after filtering
    executionTime: number;             // Query execution time (ms)
    usedIndex: boolean;                // Whether indexes were used
  };
}
```

### License

MIT 

### Contact

For any questions or feedback, please contact me at [douyaj33@gmail.com](mailto:douyaj33@gmail.com).

For issues and support, visit the [GitHub Issues page](https://github.com/zxbb1190/nodedb-json/issues).
