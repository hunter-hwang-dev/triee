// const cookieParser = require("cookie-parser");
// app.use(cookieParser());

//MongoDB 연결-------------------------------------------------------------------
// let connectDB = require("./database.js");

// let db;
// connectDB
//   .then((client) => {
//     //오래 걸리는 건 export하기보단 server.js에 담는 것이 나음.
//     console.log("DB connected");
//     db = client.db("trieeDB");

//     app.listen(process.env.PORT, () => {
//       console.log("서버 실행중: " + "http://localhost:" + process.env.PORT);
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//   });
//-------------------------------------------------------------------------------
