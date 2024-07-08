const http = require("http");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const { exec } = require("child_process");
const db = require("./db.js");
const { normalize } = require("path");
const app = express();
const server = http.createServer(app);

app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const hostname = "127.0.0.1";
const port = 3005;

let isAdmin = {};
isAdmin["admin"] = true;

let book = {
  "Penguin Books": { "George Orwell": "1984" },
  HarperCollins: { "J.R.R. Tolkien": "The Hobbit" },
  "Random House": { "Markus Zusak": "The Book Thief" },
  "Simon & Schuster": { "Stephen King": "The Shining" },
  "Hachette Book Group": { "Malcolm Gladwell": "Outliers" },
};

let newBook = {};

function reload() {
  var obj = {};
  if (obj.__proto__.client) {
    obj.__proto__.client = undefined;
    console.log("client clear");
  }
  if (obj.__proto__.escapeFunction) {
    obj.__proto__.escapeFunction = undefined;
    console.log("escapeFunction clear");
  }
}

const filePath = "./flag.txt";
const checkInterval = 1000; // 1초마다 체크

function checkFileOpened() {
  const command = `inotifywait -e open --format '%w%f' ${filePath}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing inotifywait: ${error.message}`);
      return;
    }

    if (stdout) {
      setTimeout(() => reload(), 1000);
      console.log(`File opened: ${stdout.trim()}`);
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
  });
}

setInterval(checkFileOpened, checkInterval);

app.use(
  session({
    secret: "session_key",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", (req, res) => {
  res.render("index", { book: book });
});

app.get("/login", (req, res) => {
  res.render("login", { errorMessage: null });
});

app.post("/login", (req, res) => {
  const { uid, upw } = req.body;
  db.get(
    `SELECT * FROM users WHERE uid = ? AND upw = ?`,
    [uid, upw],
    (err, user) => {
      if (user) {
        req.session.uid = user.uid;
        req.session.name = user.name;
        res.send(`
            <html>
            <body>
            <script>
                alert('로그인이 완료되었습니다.');
                window.location.href = '/';
            </script>
            </body>
            </html>
            `);
      } else {
        res.render("login", { errorMessage: "Invalid credentials" });
      }
    }
  );
});

app.get("/register", (req, res) => {
  res.render("register", { errorMessage: null });
});

app.post("/register", (req, res) => {
  const { uid, name, upw, upw_check } = req.body;
  if (name == "admin") {
    res.render("register", {
      errorMessage: "이름을 admin으로 할 수 없습니다.",
    });
  } else if (upw != upw_check) {
    res.render("register", {
      errorMessage: "password가 일치하지 않습니다.",
    });
  } else {
    db.get(`SELECT uid FROM users WHERE uid = ?`, [uid], (err, row) => {
      if (row) {
        res.render("register", { errorMessage: "이미 존재하는 ID입니다." });
      } else {
        db.run(
          `INSERT INTO users (uid, upw, name) VALUES (?, ?, ?)`,
          [uid, upw, name],
          function (err) {
            if (err) {
              res.render("register", {
                errorMessage: "Error registering user",
              });
            } else {
              res.send(`
                <html>
                <body>
                <script>
                    alert('회원가입이 완료되었습니다.');
                    window.location.href = '/login';
                </script>
                </body>
                </html>
                `);
            }
          }
        );
      }
    });
  }
});

app.get("/re", (req, res) => {
  reload();
  res.send("good");
});

app.get("/admin", (req, res) => {
  if (req.session.name) {
    if (isAdmin[req.session.name]) {
      res.sendFile(path.join(__dirname, "views", "admin.html"));
    } else {
      res.send("nono!");
    }
  } else {
    res.send("plz login");
  }
});

app.post("/admin", (req, res) => {
  if (req.session.name) {
    if (isAdmin[req.session.name]) {
      const { bookPublisher, bookAuthor, bookTitle } = req.body;
      const filterValues = [
        "process",
        "child",
        "exec",
        "eval",
        "spawn",
        "main",
        "module",
        "string",
        "return",
        "true",
        "join",
        "flag",
        "+",
      ];

      filterValues.forEach((filterValue) => {
        if (bookTitle.toLowerCase().includes(filterValue)) {
          res.send("Invalid bookTitle");
          return;
        }
      });

      if (!newBook[bookPublisher]) {
        newBook[bookPublisher] = {};
      }
      newBook[bookPublisher][bookAuthor] = bookTitle;

      res.send(`
    <html>
    <body>
    <script>
        alert('편집 완료되었습니다!');
        window.location.href = '/admin';
    </script>
    </body>
    </html>
    `);
    } else {
      res.send("nono!");
    }
  } else {
    res.send("plz login");
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
