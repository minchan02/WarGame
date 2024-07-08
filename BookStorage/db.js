const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(
  "./users.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Error when connecting to the database", err.message);
    } else {
      console.log("Database connection successfully established");
    }
  }
);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT UNIQUE NOT NULL,
    upw TEXT NOT NULL,
    name TEXT NOT NULL
  )`,
    (err) => {
      if (err) {
        console.error("Error creating table", err.message);
      } else {
        console.log("Table created or already exists");
      }
    }
  );
});

// 데이터베이스 연결을 다른 모듈에서 사용할 수 있도록 export
module.exports = db;
