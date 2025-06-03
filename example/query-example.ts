import NodedbJson from '../src/index';
import { QueryOptions } from '../src/types';

// 定义用户接口
interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  department: string;
  salary: number;
  city: string;
  joinDate: string;
}

// 创建数据库实例
const db = new NodedbJson('./example/database.json');

// 初始化测试数据
function initializeData() {
  console.log('🔄 初始化测试数据...');
  
  const users: User[] = [
    { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com', department: '技术部', salary: 12000, city: '北京', joinDate: '2022-01-15' },
    { id: 2, name: '李四', age: 32, email: 'lisi@example.com', department: '销售部', salary: 10000, city: '上海', joinDate: '2021-03-20' },
    { id: 3, name: '王五', age: 29, email: 'wangwu@example.com', department: '技术部', salary: 15000, city: '深圳', joinDate: '2020-07-10' },
    { id: 4, name: '赵六', age: 25, email: 'zhaoliu@example.com', department: '人事部', salary: 8000, city: '北京', joinDate: '2023-02-01' },
    { id: 5, name: '孙七', age: 35, email: 'sunqi@example.com', department: '销售部', salary: 13000, city: '广州', joinDate: '2019-11-05' },
    { id: 6, name: '周八', age: 27, email: 'zhouba@example.com', department: '技术部', salary: 11000, city: '杭州', joinDate: '2022-09-12' },
    { id: 7, name: '吴九', age: 30, email: 'wujiu@example.com', department: '财务部', salary: 9000, city: '成都', joinDate: '2021-06-18' },
    { id: 8, name: '郑十', age: 26, email: 'zhengshi@example.com', department: '技术部', salary: 14000, city: '西安', joinDate: '2022-12-03' },
    { id: 9, name: '陈一', age: 33, email: 'chenyi@example.com', department: '销售部', salary: 11500, city: '重庆', joinDate: '2020-04-22' },
    { id: 10, name: '林二', age: 24, email: 'liner@example.com', department: '人事部', salary: 7500, city: '福州', joinDate: '2023-08-15' },
  ];
  
  db.set('users', users);
  
  // 创建索引以提高查询性能
  db.createIndex('users', { type: 'unique', field: 'id' });
  db.createIndex('users', { type: 'multi', field: 'department' });
  db.createIndex('users', { type: 'multi', field: 'city' });
  
  console.log('✅ 测试数据初始化完成，共', users.length, '条记录');
}

// 基础复杂查询示例
function basicQueryExample() {
  console.log('\n📊 === 基础复杂查询示例 ===');
  
  // 1. 基础查询：查找技术部员工，按薪资降序排序
  console.log('\n1. 查找技术部员工，按薪资降序排序：');
  const techUsers = db.query<User>('users', {
    where: { department: '技术部' },
    sort: { field: 'salary', direction: 'desc' }
  });
  
  console.log('查询结果:', techUsers.data.length, '条记录');
  console.log('执行时间:', techUsers.stats.executionTime.toFixed(2), 'ms');
  console.log('是否使用索引:', techUsers.stats.usedIndex);
  techUsers.data.forEach(user => {
    console.log(`  - ${user.name} (${user.department}): ¥${user.salary}`);
  });
}

// 多字段排序示例
function multiSortExample() {
  console.log('\n📊 === 多字段排序示例 ===');
  
  // 按部门升序，再按薪资降序排序
  console.log('\n按部门升序，再按薪资降序排序：');
  const sortedUsers = db.query<User>('users', {
    sort: [
      { field: 'department', direction: 'asc' },
      { field: 'salary', direction: 'desc' }
    ]
  });
  
  sortedUsers.data.forEach(user => {
    console.log(`  - ${user.department} | ${user.name}: ¥${user.salary}`);
  });
}

// 分页查询示例
function paginationExample() {
  console.log('\n📊 === 分页查询示例 ===');
  
  // 分页查询：每页3条，查看第2页
  console.log('\n分页查询（每页3条，第2页）：');
  const paginatedResult = db.query<User>('users', {
    sort: { field: 'salary', direction: 'desc' },
    pagination: { page: 2, pageSize: 3 }
  });
  
  console.log('分页信息:');
  console.log(`  - 当前页: ${paginatedResult.pagination?.currentPage}`);
  console.log(`  - 每页数量: ${paginatedResult.pagination?.pageSize}`);
  console.log(`  - 总记录数: ${paginatedResult.pagination?.totalItems}`);
  console.log(`  - 总页数: ${paginatedResult.pagination?.totalPages}`);
  console.log(`  - 有上一页: ${paginatedResult.pagination?.hasPrevious}`);
  console.log(`  - 有下一页: ${paginatedResult.pagination?.hasNext}`);
  
  console.log('\n当前页数据:');
  paginatedResult.data.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.name}: ¥${user.salary}`);
  });
}

// 聚合查询示例
function aggregationExample() {
  console.log('\n📊 === 聚合查询示例 ===');
  
  // 聚合查询：统计各种数据
  console.log('\n全员统计信息：');
  const aggregationResult = db.query<User>('users', {
    aggregation: [
      { type: 'count' },
      { type: 'avg', field: 'salary' },
      { type: 'sum', field: 'salary' },
      { type: 'min', field: 'salary' },
      { type: 'max', field: 'salary' },
      { type: 'group', groupBy: 'department' }
    ]
  });
  
  if (aggregationResult.aggregations) {
    aggregationResult.aggregations.forEach(agg => {
      switch (agg.type) {
        case 'count':
          console.log(`  - 总人数: ${agg.value}`);
          break;
        case 'avg':
          console.log(`  - 平均薪资: ¥${(agg.value as number).toFixed(2)}`);
          break;
        case 'sum':
          console.log(`  - 薪资总额: ¥${agg.value}`);
          break;
        case 'min':
          console.log(`  - 最低薪资: ¥${agg.value}`);
          break;
        case 'max':
          console.log(`  - 最高薪资: ¥${agg.value}`);
          break;
        case 'group':
          console.log('  - 部门分组:');
          const groups = agg.value as Record<string, User[]>;
          Object.entries(groups).forEach(([dept, users]) => {
            console.log(`    * ${dept}: ${users.length}人`);
          });
          break;
      }
    });
  }
}

// 字段选择（投影）示例
function selectFieldsExample() {
  console.log('\n📊 === 字段选择（投影）示例 ===');
  
  // 只查询特定字段
  console.log('\n只查询姓名和薪资字段：');
  const selectedResult = db.query<User>('users', {
    where: { department: '技术部' },
    select: ['name', 'salary'],
    sort: { field: 'salary', direction: 'desc' }
  });
  
  selectedResult.data.forEach(user => {
    console.log(`  - ${user.name}: ¥${user.salary}`);
  });
}

// 复合查询示例
function complexQueryExample() {
  console.log('\n📊 === 复合查询示例 ===');
  
  // 复杂查询：技术部，薪资>12000，按年龄排序，分页
  console.log('\n复合查询：技术部 + 薪资>12000 + 按年龄排序 + 分页：');
  const complexResult = db.query<User>('users', {
    where: (user: User) => user.department === '技术部' && user.salary > 12000,
    sort: { field: 'age', direction: 'asc' },
    pagination: { page: 1, pageSize: 2 },
    select: ['name', 'age', 'salary'],
    aggregation: [
      { type: 'count' },
      { type: 'avg', field: 'salary' }
    ]
  });
  
  console.log('查询结果:');
  complexResult.data.forEach(user => {
    console.log(`  - ${user.name}, ${user.age}岁, ¥${user.salary}`);
  });
  
  console.log('\n统计信息:');
  console.log(`  - 符合条件总数: ${complexResult.aggregations?.[0]?.value}`);
  console.log(`  - 平均薪资: ¥${(complexResult.aggregations?.[1]?.value as number)?.toFixed(2)}`);
  console.log(`  - 执行时间: ${complexResult.stats.executionTime.toFixed(2)}ms`);
}

// 便捷方法示例
function convenienceMethodsExample() {
  console.log('\n📊 === 便捷方法示例 ===');
  
  // 1. orderBy 方法
  console.log('\n1. 使用 orderBy 方法（前3名高薪员工）：');
  const topSalary = db.orderBy<User>('users', 
    { field: 'salary', direction: 'desc' }, 
    3
  );
  topSalary.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.name}: ¥${user.salary}`);
  });
  
  // 2. paginate 方法
  console.log('\n2. 使用 paginate 方法：');
  const pageResult = db.paginate<User>('users', 1, 3, { department: '销售部' });
  console.log(`销售部员工（第1页，每页3条）：`);
  pageResult.data.forEach(user => {
    console.log(`  - ${user.name}: ¥${user.salary}`);
  });
  
  // 3. count 方法
  console.log('\n3. 使用 count 方法：');
  const techCount = db.count<User>('users', { department: '技术部' });
  console.log(`技术部员工数量: ${techCount}`);
  
  // 4. distinct 方法
  console.log('\n4. 使用 distinct 方法（所有部门）：');
  const departments = db.distinct('users', 'department');
  console.log('所有部门:', departments.join(', '));
  
  // 5. aggregate 方法
  console.log('\n5. 使用 aggregate 方法（技术部薪资统计）：');
  const techStats = db.aggregate<User>('users', [
    { type: 'count' },
    { type: 'avg', field: 'salary' },
    { type: 'max', field: 'salary' }
  ], { department: '技术部' });
  
  techStats.forEach(stat => {
    console.log(`  - ${stat.type}: ${stat.value}`);
  });
}

// 性能测试
function performanceTest() {
  console.log('\n🚀 === 性能测试 ===');
  
  // 生成大量测试数据
  console.log('\n生成大量测试数据进行性能测试...');
  const bigData: User[] = [];
  const departments = ['技术部', '销售部', '人事部', '财务部', '市场部'];
  const cities = ['北京', '上海', '深圳', '广州', '杭州', '成都', '西安'];
  
  for (let i = 1; i <= 1000; i++) {
    bigData.push({
      id: i,
      name: `用户${i}`,
      age: 20 + (i % 40),
      email: `user${i}@example.com`,
      department: departments[i % departments.length],
      salary: 8000 + (i % 10) * 1000,
      city: cities[i % cities.length],
      joinDate: '2022-01-01'
    });
  }
  
  db.set('bigUsers', bigData);
  db.createIndex('bigUsers', { type: 'multi', field: 'department' });
  db.createIndex('bigUsers', { type: 'unique', field: 'id' });
  
  console.log(`生成了 ${bigData.length} 条测试数据`);
  
  // 测试索引查询性能
  console.log('\n测试索引查询性能：');
  const start1 = performance.now();
  const indexResult = db.query<User>('bigUsers', {
    where: { department: '技术部' },
    sort: { field: 'salary', direction: 'desc' },
    pagination: { page: 1, pageSize: 10 }
  });
  const end1 = performance.now();
  
  console.log(`索引查询结果: ${indexResult.data.length} 条记录`);
  console.log(`执行时间: ${(end1 - start1).toFixed(2)}ms`);
  console.log(`是否使用索引: ${indexResult.stats.usedIndex}`);
  
  // 测试复杂聚合查询
  console.log('\n测试复杂聚合查询：');
  const start2 = performance.now();
  const aggResult = db.query<User>('bigUsers', {
    aggregation: [
      { type: 'count' },
      { type: 'group', groupBy: 'department' },
      { type: 'avg', field: 'salary' }
    ]
  });
  const end2 = performance.now();
  
  console.log(`聚合查询执行时间: ${(end2 - start2).toFixed(2)}ms`);
  console.log(`总记录数: ${aggResult.aggregations?.[0]?.value}`);
  console.log(`平均薪资: ¥${(aggResult.aggregations?.[2]?.value as number)?.toFixed(2)}`);
}

// 主函数
function main() {
  console.log('🎯 NodeDB-JSON 复杂查询功能演示');
  console.log('=====================================');
  
  try {
    // 初始化数据
    initializeData();
    
    // 基础查询示例
    basicQueryExample();
    
    // 多字段排序示例
    multiSortExample();
    
    // 分页查询示例
    paginationExample();
    
    // 聚合查询示例
    aggregationExample();
    
    // 字段选择示例
    selectFieldsExample();
    
    // 复合查询示例
    complexQueryExample();
    
    // 便捷方法示例
    convenienceMethodsExample();
    
    // 性能测试
    performanceTest();
    
    console.log('\n✅ 所有演示完成！');
    
  } catch (error) {
    console.error('❌ 演示过程中出现错误:', error);
  }
}

// 运行演示
if (require.main === module) {
  main();
}

export default main; 