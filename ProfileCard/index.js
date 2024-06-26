const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const multer = require("multer");
require("dotenv").config();

const db = mongoose.connection;
const app = express();
const server = http.createServer(app);

const port = 4001;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

app.use(
  session({
    secret: 'session_key',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const userSchema = new mongoose.Schema({
  uid: String,
  upw: String,
  profilePicture: String,
});

let User = mongoose.model("User", userSchema);

mongoose
  .connect(process.env.MONGO_URL || "mongodb://localhost:27017/userdb")
  .then(async () => {
    console.log("MongoDB에 연결되었습니다!");
  })
  .catch((err) => {
    console.error("MongoDB 연결 에러:", err);
  });

app.get("/", async (req, res) => {
  if (req.session.user) {
    res.render("index", req.session.user);
  } else {
    res.render("index", { uid: null });
  }
});

app.get("/login", async (req, res) => {
  if (req.query.uid && req.query.upw) {
    const { uid, upw } = req.query;
    try {
      const query = { uid: { $eq: uid }, upw: { $eq: upw } };
      let user = await User.findOne(query);

      if (user != null) {
        req.session.user = user;
        res.redirect("/");
      } else {
        res.render("login", { errorMessage: "ID 혹은 비밀번호가 틀렸습니다!" });
      }
    } catch (err) {
      res.send(err);
    }
  } else if (req.query.uid && !req.query.upw) {
    res.render("login", { errorMessage: "비밀번호를 입력해주세요!" });
  } else if (!req.query.uid && req.query.upw) {
    res.render("login", { errorMessage: "ID를 입력해주세요!" });
  } else {
    res.render("login", { errorMessage: null });
  }
});

app.get("/register", (req, res) => {
  res.render("register", { errorMessage: null });
});

app.post("/register", async (req, res) => {
  const { uid, upw, upw_check } = req.body;
  try {
    if (upw == upw_check) {
      const query = { uid: { $eq: uid } };
      let user = await User.findOne(query);
      if (user) {
        res.render("register", { errorMessage: "이미 존재하는 ID입니다." });
      } else {
        const newUser = new User({ uid, upw });
        await newUser.save();
        res.redirect("/login");
      }
    } else {
      res.render("register", { errorMessage: "Password가 일치하지 않습니다." });
    }
  } catch (err) {
    res.send(err);
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.send(`
      <html>
      <body>
        <script>
          alert('로그아웃이 완료되었습니다.');
          window.location.href = '/';
        </script>
      </body>
      </html>
    `);
  });
});

app.get("/user", async (req, res) => {
  if (req.session.user) {
    try {
      const uid = req.session.user.uid;
      const upw = req.session.user.upw;

      let myInfo = await User.findOne({ uid, upw });
      req.session.user = myInfo;
      myInfo = myInfo.toObject();
      delete myInfo._id;
      delete myInfo.__v;
      delete myInfo.upw;

      res.render("user", { myInfo });
    } catch (err) {
      res.send(err);
    }
  } else {
    res.send(`
      <html>
      <body>
        <script>
          alert('로그인 후 이용 가능합니다!');
          window.location.href = '/';
        </script>
      </body>
      </html>
    `);
  }
});

app.post("/user/addField", async (req, res) => {
  if (req.session.user) {
    const uid = req.session.user.uid;
    const updateFields = {};
    try {
      for (const key in req.body) {
        if (key == "uid" || key == "upw" || key == "_id" || key == "__v") {
          continue;
        }
        if (req.body.hasOwnProperty(key)) {
          updateFields[key] = req.body[key];

          const newField = {};
          newField[key] = { type: mongoose.Schema.Types.Mixed };
          userSchema.add(newField);
        }
      }
      await User.updateOne({ uid }, { $set: updateFields });

      res.redirect("/user");
    } catch (err) {
      res.send(err);
    }
  } else {
    res.send("Access denied");
  }
});

app.post(
  "/user/uploadProfilePicture",
  upload.single("profilePicture"),
  async (req, res) => {
    if (req.session.user) {
      const uid = req.session.user.uid;
      const profilePicturePath = `/images/${req.file.filename}`;

      await User.updateOne(
        { uid },
        { $set: { profilePicture: profilePicturePath } }
      );

      res.redirect("/user");
    } else {
      res.send("Access denied");
    }
  }
);

server.listen(port, () => {
  console.log(`Server running at ${port}`);
});
