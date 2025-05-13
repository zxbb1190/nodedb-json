import { AnyValue, PredicateFunction, UpdaterObject, DbOptions } from './types';
/**
 * A class to manage JSON-based database operations.
 */
declare class NodedbJson {
    private filePath;
    private data;
    private options;
    private _pendingChanges;
    /**
     * Creates an instance of NodedbJson.
     * @param {string} filePath - The path to the JSON file.
     * @param {DbOptions} [options] - Database options.
     */
    constructor(filePath: string, options?: DbOptions);
    /**
     * Reads the JSON file.
     * @returns {object} - The parsed JSON data.
     */
    private readJSONFile;
    /**
     * Writes the JSON data to the file.
     */
    private writeJSONFile;
    /**
     * Manually save changes to file.
     * @returns {NodedbJson} - The instance of the database for chaining.
     */
    save(): NodedbJson;
    /**
     * Sets a value in the JSON data.
     * @param {string} key - The key to set.
     * @param {any} value - The value to set.
     * @returns {NodedbJson} - The instance of the database for chaining.
     */
    set(key: string, value: AnyValue): NodedbJson;
    /**
     * Gets a value from the JSON data.
     * @param {string} key - The key to get.
     * @returns {any} - The value.
     */
    get(key: string): AnyValue;
    /**
     * Checks if a key exists in the JSON data.
     * @param {string} key - The key to check.
     * @returns {boolean} - True if the key exists, otherwise false.
     */
    has(key: string): boolean;
    /**
     * Updates a value in the JSON data.
     * @param {string} key - The key to update.
     * @param {function|object} predicateOrUpdater - The predicate function or updater object.
     * @param {object} [updater] - The updater object if a predicate function is provided.
     * @returns {NodedbJson} - The instance of the database for chaining.
     */
    update<T>(key: string, predicateOrUpdater: PredicateFunction<T> | UpdaterObject, updater?: UpdaterObject): NodedbJson;
    /**
     * Deletes a value from the JSON data.
     * @param {string} key - The key to delete.
     * @param {function|string[]} [predicateOrKeys] - The predicate function or array of keys to delete.
     * @param {string} [field='id'] - The field to match for array deletion.
     * @returns {NodedbJson} - The instance of the database for chaining.
     */
    delete<T>(key: string, predicateOrKeys?: PredicateFunction<T> | string[], field?: string): NodedbJson;
    /**
     * Finds a value in the JSON data.
     * @param {string} key - The key to find.
     * @param {function} predicate - The predicate function to match.
     * @returns {any} - The found value.
     */
    find<T>(key: string, predicate: PredicateFunction<T>): T | undefined;
    /**
     * Filters values in the JSON data.
     * @param {string} key - The key to filter.
     * @param {function} predicate - The predicate function to match.
     * @returns {any[]} - The filtered values.
     */
    filter<T>(key: string, predicate: PredicateFunction<T>): T[];
    /**
     * Pushes a value into an array in the JSON data.
     * @param {string} key - The key to push to.
     * @param {any|any[]} value - The value or values to push.
     * @returns {NodedbJson} - The instance of the database for chaining.
     */
    push(key: string, value: AnyValue | AnyValue[]): NodedbJson;
    /**
     * Executes multiple operations in batch.
     * @param {Array<{method: string, args: any[]}>} operations - Array of operations to execute.
     * @returns {NodedbJson} - The instance of the database for chaining.
     */
    batch(operations: Array<{
        method: string;
        args: any[];
    }>): NodedbJson;
}
export default NodedbJson;
