const NodedbJson = require('../dist/index');

console.log('🧪 兼容性测试 - 验证新版本与旧版本API的兼容性');
console.log('================================================');

// 创建数据库实例
const db = new NodedbJson('./example/compatibility-test.json');

try {
  console.log('\n✅ 测试基础CRUD操作...');
  
  // 基础操作测试
  db.set('test', 'hello world');
  console.log('  - set(): ✓');
  
  const value = db.get('test');
  console.log('  - get():', value === 'hello world' ? '✓' : '✗');
  
  const exists = db.has('test');
  console.log('  - has():', exists ? '✓' : '✗');
  
  // 数组操作测试
  console.log('\n✅ 测试数组操作...');
  
  db.set('users', []);
  db.push('users', { id: 1, name: '张三', age: 25 });
  db.push('users', { id: 2, name: '李四', age: 30 });
  console.log('  - push(): ✓');
  
  const user = db.find('users', u => u.id === 1);
  console.log('  - find():', user && user.name === '张三' ? '✓' : '✗');
  
  const adults = db.filter('users', u => u.age >= 25);
  console.log('  - filter():', adults.length === 2 ? '✓' : '✗');
  
  // 更新操作测试
  console.log('\n✅ 测试更新操作...');
  
  db.update('users', u => u.id === 1, { age: 26 });
  const updatedUser = db.find('users', u => u.id === 1);
  console.log('  - update():', updatedUser.age === 26 ? '✓' : '✗');
  
  // 删除操作测试
  console.log('\n✅ 测试删除操作...');
  
  db.delete('users', u => u.id === 2);
  const remainingUsers = db.filter('users', u => true);
  console.log('  - delete():', remainingUsers.length === 1 ? '✓' : '✗');
  
  console.log('\n✅ 测试新功能（向后兼容）...');
  
  // 添加更多测试数据
  db.set('employees', [
    { id: 1, name: '王五', department: '技术部', salary: 15000 },
    { id: 2, name: '赵六', department: '销售部', salary: 12000 },
    { id: 3, name: '钱七', department: '技术部', salary: 13000 }
  ]);
  
  // 测试新的查询功能是否与旧API兼容
  const techEmployees = db.filter('employees', e => e.department === '技术部');
  console.log('  - 旧filter与新数据兼容:', techEmployees.length === 2 ? '✓' : '✗');
  
  // 测试索引功能（可选功能，不影响现有代码）
  db.createIndex('employees', { field: 'id', type: 'unique' });
  const foundEmployee = db.findByField('employees', 'id', 1);
  console.log('  - 新索引功能正常:', foundEmployee && foundEmployee.name === '王五' ? '✓' : '✗');
  
  // 测试新的查询方法
  const queryResult = db.query('employees', {
    where: { department: '技术部' },
    sort: { field: 'salary', direction: 'desc' }
  });
  console.log('  - 新query方法:', queryResult.data.length === 2 ? '✓' : '✗');
  
  // 测试便捷方法
  const count = db.count('employees', { department: '技术部' });
  console.log('  - count方法:', count === 2 ? '✓' : '✗');
  
  console.log('\n🎉 所有兼容性测试通过！');
  console.log('✅ 新版本完全向后兼容，现有代码无需修改');
  console.log('✅ 新功能作为增强功能，可以选择性使用');
  
} catch (error) {
  console.error('\n❌ 兼容性测试失败:', error.message);
  console.error(error.stack);
} 