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
} 