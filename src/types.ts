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
  }
}

/**
 * 排序方向
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 排序选项
 */
export interface SortOption {
  /**
   * 排序字段
   */
  field: string;
  
  /**
   * 排序方向
   */
  direction: SortDirection;
}

/**
 * 分页选项
 */
export interface PaginationOption {
  /**
   * 页码（从1开始）
   */
  page: number;
  
  /**
   * 每页数量
   */
  pageSize: number;
}

/**
 * 分页结果
 */
export interface PaginationResult<T> {
  /**
   * 当前页数据
   */
  data: T[];
  
  /**
   * 分页信息
   */
  pagination: {
    /**
     * 当前页码
     */
    currentPage: number;
    
    /**
     * 每页数量
     */
    pageSize: number;
    
    /**
     * 总记录数
     */
    totalItems: number;
    
    /**
     * 总页数
     */
    totalPages: number;
    
    /**
     * 是否有上一页
     */
    hasPrevious: boolean;
    
    /**
     * 是否有下一页
     */
    hasNext: boolean;
  };
}

/**
 * 聚合操作类型
 */
export type AggregationType = 'count' | 'sum' | 'avg' | 'min' | 'max' | 'group';

/**
 * 聚合选项
 */
export interface AggregationOption {
  /**
   * 聚合类型
   */
  type: AggregationType;
  
  /**
   * 操作字段（用于数值聚合）
   */
  field?: string;
  
  /**
   * 分组字段（用于分组聚合）
   */
  groupBy?: string;
}

/**
 * 聚合结果
 */
export interface AggregationResult {
  /**
   * 聚合类型
   */
  type: AggregationType;
  
  /**
   * 聚合值
   */
  value: number | Record<string, number> | Record<string, any[]>;
  
  /**
   * 操作字段
   */
  field?: string;
  
  /**
   * 分组字段
   */
  groupBy?: string;
}

/**
 * 复杂查询选项
 */
export interface QueryOptions<T = any> {
  /**
   * 过滤条件
   */
  where?: PredicateFunction<T> | Record<string, any>;
  
  /**
   * 排序选项
   */
  sort?: SortOption | SortOption[];
  
  /**
   * 分页选项
   */
  pagination?: PaginationOption;
  
  /**
   * 聚合选项
   */
  aggregation?: AggregationOption[];
  
  /**
   * 选择字段（投影）
   */
  select?: string[];
  
  /**
   * 限制返回数量
   */
  limit?: number;
  
  /**
   * 跳过记录数
   */
  skip?: number;
}

/**
 * 查询结果
 */
export interface QueryResult<T = any> {
  /**
   * 查询到的数据
   */
  data: T[];
  
  /**
   * 分页信息（如果使用分页）
   */
  pagination?: PaginationResult<T>['pagination'];
  
  /**
   * 聚合结果（如果使用聚合）
   */
  aggregations?: AggregationResult[];
  
  /**
   * 查询统计信息
   */
  stats: {
    /**
     * 总记录数（过滤前）
     */
    totalRecords: number;
    
    /**
     * 过滤后记录数
     */
    filteredRecords: number;
    
    /**
     * 查询执行时间（毫秒）
     */
    executionTime: number;
    
    /**
     * 是否使用了索引
     */
    usedIndex: boolean;
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