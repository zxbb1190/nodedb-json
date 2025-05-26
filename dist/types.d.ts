/**
 * 表示任何 JavaScript 值的类型
 */
export type AnyValue = any;
/**
 * 表示谓词函数的类型
 */
export type PredicateFunction<T> = (item: T) => boolean;
/**
 * 表示更新器对象的类型
 */
export type UpdaterObject = Record<string, any>;
/**
 * 索引的类型
 */
export type IndexType = 'unique' | 'multi';
/**
 * 索引结构
 */
export interface IndexDefinition {
    /**
     * 索引类型：unique (唯一索引) 或 multi (多值索引)
     */
    type: IndexType;
    /**
     * 索引的字段
     */
    field: string;
}
/**
 * 内部索引存储格式
 */
export interface IndexStore {
    [key: string]: {
        [fieldValue: string]: number | number[];
    };
}
/**
 * 数据库配置选项
 */
export interface DbOptions {
    /**
     * 是否在每次修改后自动保存
     */
    autoSave?: boolean;
    /**
     * 是否在初始化时创建文件
     */
    createIfNotExists?: boolean;
    /**
     * 文件的默认内容
     */
    defaultValue?: Record<string, any>;
    /**
     * 是否启用索引功能
     */
    enableIndexing?: boolean;
    /**
     * 是否在启动时自动创建索引
     */
    autoIndex?: boolean;
}
