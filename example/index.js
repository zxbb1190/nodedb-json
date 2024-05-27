const NodedbJson = require("../index");
const path = require("path");

// 创建或加载 JSON 文件
const db = new NodedbJson(path.resolve(__dirname, "db/db.json"));

// 设置数据
db.set("user.name", "Alice").set("user.age", 25);

// 获取数据
console.log(db.get("user")); // { name: 'Alice', age: 25 }

// Array operations
db.set("users", []).push("users", { name: "Bob", age: 30 }).push("users", { name: "Charlie", age: 35 });

console.log(db.get("users")); // [{ name: 'Bob', age: 30 }, { name: 'Charlie', age: 35 }]

db.delete("users", (user) => user.name === "Bob");
console.log(db.get("users")); // [{ name: 'Charlie', age: 35 }]

db.update("users", (user) => user.name === "Charlie", { age: 36 });
console.log(db.get("users")); // [{ name: 'Charlie', age: 36 }]

console.log(db.find("users", (user) => user.name === "Charlie")); // { name: 'Charlie', age: 36 }
console.log(db.filter("users", (user) => user.age > 30)); // [{ name: 'Charlie', age: 36 }]
