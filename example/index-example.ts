import * as path from 'path';
import NodedbJson from '../src/index';

// 定义用户接口
interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  role?: string;
}

// 创建或加载 JSON 文件
const db = new NodedbJson(path.resolve(__dirname, "db/index-db.json"), {
  autoSave: true,
  createIfNotExists: true,
  defaultValue: { initialized: true },
  enableIndexing: true, // 启用索引功能
  autoIndex: true // 自动创建已定义的索引
});

// 准备测试数据
console.log("=== 准备测试数据 ===");
const users: User[] = [];

// 生成测试数据
for (let i = 1; i <= 10000; i++) {
  users.push({
    id: i,
    name: `User${i}`,
    age: Math.floor(Math.random() * 50) + 20, // 20-69岁
    email: `user${i}@example.com`
  });
}

// 保存用户数据
db.set("users", users);
console.log(`已创建 ${users.length} 个用户记录`);

// 创建索引
console.log("\n=== 创建索引 ===");
console.time("创建id索引");
db.createIndex("users", { field: "id", type: "unique" });
console.timeEnd("创建id索引");

console.time("创建email索引");
db.createIndex("users", { field: "email", type: "unique" });
console.timeEnd("创建email索引");

console.time("创建age索引");
db.createIndex("users", { field: "age", type: "multi" });
console.timeEnd("创建age索引");

// 查看所有索引
console.log("\n现有索引:", db.getIndexes());

// 性能测试：使用索引查询 vs 不使用索引查询
console.log("\n=== 性能测试：按ID查询 ===");

// 随机选择一个ID
const randomId = Math.floor(Math.random() * 10000) + 1;

// 使用普通查找
console.time("普通查找");
const userByFind = db.find<User>("users", user => user.id === randomId);
console.timeEnd("普通查找");

// 使用索引查找
console.time("索引查找");
const userByIndex = db.findByField<User>("users", "id", randomId);
console.timeEnd("索引查找");

console.log("查找结果是否一致:", userByFind?.id === userByIndex?.id);

// 性能测试：按邮箱查询
console.log("\n=== 性能测试：按邮箱查询 ===");
const randomEmail = `user${randomId}@example.com`;

// 使用普通查找
console.time("普通查找");
const userByEmailFind = db.find<User>("users", user => user.email === randomEmail);
console.timeEnd("普通查找");

// 使用索引查找
console.time("索引查找");
const userByEmailIndex = db.findByField<User>("users", "email", randomEmail);
console.timeEnd("索引查找");

console.log("查找结果是否一致:", userByEmailFind?.id === userByEmailIndex?.id);

// 性能测试：按年龄范围过滤
console.log("\n=== 性能测试：按年龄范围过滤 ===");

// 设置年龄范围
const ageValues = [30, 40, 50];

// 使用普通过滤
console.time("普通过滤");
const usersByAgeFilter = db.filter<User>("users", user => ageValues.includes(user.age));
console.timeEnd("普通过滤");

// 使用索引过滤
console.time("索引过滤");
const usersByAgeIndex = db.filterByField<User>("users", "age", ageValues);
console.timeEnd("索引过滤");

console.log("普通过滤结果数量:", usersByAgeFilter.length);
console.log("索引过滤结果数量:", usersByAgeIndex.length);

// 测试删除和更新操作
console.log("\n=== 测试删除和更新操作 ===");

// 使用索引更新
console.time("索引更新");
db.update<User>("users", { id: randomId }, { role: "admin" });
console.timeEnd("索引更新");

// 验证更新
const updatedUser = db.findByField<User>("users", "id", randomId);
console.log("用户已更新:", updatedUser?.role === "admin");

// 使用索引删除
console.time("索引删除");
db.delete("users", [String(randomId)], "id");
console.timeEnd("索引删除");

// 验证删除
const deletedUser = db.findByField<User>("users", "id", randomId);
console.log("用户已删除:", deletedUser === undefined);

// 删除索引
console.log("\n=== 删除索引 ===");
db.dropIndex("users", "age");
console.log("删除后的索引:", db.getIndexes());

console.log("\n索引功能测试完成！"); 