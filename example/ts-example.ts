import * as path from 'path';
import NodedbJson from '../src/index';

// 定义用户接口
interface User {
  id: number;
  name: string;
  age: number;
  role?: string;
}

// 创建或加载 JSON 文件
const db = new NodedbJson(path.resolve(__dirname, "db/ts-db.json"), {
  autoSave: true,
  createIfNotExists: true,
  defaultValue: { initialized: true }
});

// 基本操作
console.log("=== 基本操作 ===");

// 设置数据
db.set("user.name", "Alice").set("user.age", 25);

// 获取数据
console.log("用户信息:", db.get("user"));

// 检查是否存在
console.log("是否存在 user.email:", db.has("user.email"));

// 数组操作
console.log("\n=== 数组操作 ===");

// 添加用户到数组
db.push("users", { id: 1, name: "Bob", age: 30 } as User);
db.push("users", [
  { id: 2, name: "Charlie", age: 35 },
  { id: 3, name: "Dave", age: 40 }
] as User[]);

// 获取所有用户
console.log("所有用户:", db.get("users"));

// 查找用户
const user = db.find<User>("users", (item) => item.id === 2);
console.log("找到用户:", user);

// 过滤用户
const adults = db.filter<User>("users", (item) => item.age >= 35);
console.log("35岁及以上的用户:", adults);

// 更新用户
db.update<User>("users", (item) => item.id === 1, { age: 31, role: "admin" });
console.log("更新后的用户:", db.find<User>("users", (item) => item.id === 1));

// 批量操作
console.log("\n=== 批量操作 ===");

db.batch([
  { method: "set", args: ["config.theme", "dark"] },
  { method: "set", args: ["config.language", "zh-CN"] },
  { method: "push", args: ["logs", { time: new Date().toISOString(), action: "配置更新" }] }
]);

console.log("配置:", db.get("config"));
console.log("日志:", db.get("logs"));

// 删除操作
console.log("\n=== 删除操作 ===");

// 删除单个用户
db.delete<User>("users", (item) => item.id === 3);
console.log("删除 ID=3 后的用户:", db.get("users"));

// 批量删除
db.delete("users", ["1"], "id");
console.log("删除 ID=1 后的用户:", db.get("users"));

// 手动保存
db.save(); 