require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.listen(process.env.PORT, () => {
  console.log(
    "서버 실행중: " + "http://localhost:" + process.env.PORT + "/handle"
  );
});

app.use(express.static(path.join(__dirname, "react-app/build")));
app.get("/react", (req, res) => {
  res.sendFile(path.join(__dirname, "react-app/build/index.html"));
});

app.use("/handle", require("./routes/handle.js")); //나중에 handle을 parameter로 변경할 것.
