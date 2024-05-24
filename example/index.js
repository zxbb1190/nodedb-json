const NodedbJson  = require('../index');
const path = require('path');

// 创建或加载 JSON 文件
const db = new NodedbJson (path.resolve(__dirname,'db/db.json'));

// 设置数据
db.set('user.name', 'Alice')
  .set('user.age', 25);

// 获取数据
console.log(db.get('user')); // { name: 'Alice', age: 25 }

// 更新数据
db.update('user.age', age => age + 1);
console.log(db.get('user.age')); // 26

// 检查数据是否存在
console.log(db.has('user.name')); // true

// 删除数据
db.delete('user.age');
console.log(db.get('user')); // { name: 'Alice' }

// 在集合中查询
db.set('posts', [
  { id: 1, title: 'First Post' },
  { id: 2, title: 'Second Post' }
]);

console.log(db.find('posts', { id: 1 })); // { id: 1, title: 'First Post' }
console.log(db.filter('posts', post => post.id > 1)); // [ { id: 2, title: 'Second Post' } ]
