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
        db.run(
          `INSERT INTO users (uid, upw, name) VALUES (?, ?, ?)`,
          ["admin", "{**Secret**}", "admin"],
          (err) => {
            if (err) {
              console.log(err);
            }
          }
        );
      }
    }
  );
});

module.exports = db;
