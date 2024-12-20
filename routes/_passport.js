// //session passport login 가져오기 시작
// const session = require("express-session");
// const passport = require("passport");
// const LocalStrategy = require("passport-local");

// app.use(passport.initialize());
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET, //털리면 큰일나요!
//     resave: false,
//     saveUninitialized: false,
//     cookie: { maxAge: Number(process.env.SESSION_EXPIRY) },
//   })
// );
// app.use(passport.session());

// passport.use(
//   new LocalStrategy(async (usernameInput, passwordInput, cb) => {
//     let result = await db
//       .collection("users")
//       .findOne({ username: usernameInput });
//     if (!result) {
//       return cb(null, false, { message: "invalid username" }); //i18n.t(errors_usernameNotFound)
//     }

//     //result.password는 가입 시 hash되어 DB에 저장.
//     if (await bcrypt.compare(passwordInput, result.password)) {
//       return cb(null, result);
//     } else {
//       return cb(null, false, { message: "invalid password" }); //i18n.t(errors_passwordMismatch)
//     }
//   })
// );

// passport.serializeUser((user, done) => {
//   console.log(user);
//   process.nextTick(() => {
//     //node.js에서 내부 코드 비동기적으로 처리 - 너무 길어지면 괄호 안에 있는 것 다음에
//     done(null, { id: user._id, username: user.username });
//   });
// });

// passport.deserializeUser(async (user, done) => {
//   //cookie 분석 > 어디서든 request.user 사용 가능하게 해줍니다.
//   let result = await db
//     .collection("users")
//     .findOne({ _id: new ObjectId(user.id) });
//   delete result.password; //비번은 삭제
//   process.nextTick(() => {
//     return done(null, result);
//   });
// });
// //session passport login 가져오기 끝
// //--------------------------------------------------------------

// app.get("/signup", (request, response) => {
//   response.render("signup.ejs");
// });

// app.post("/signup", async (request, response) => {
//   //서버에 계정 정보 추가하기 = 회원가입

//   //빈칸 exception
//   if (request.body.username == "") {
//     return response.status(400).send({ message: "Please write username." });
//   } else if (request.body.password == "") {
//     return response.status(400).send({ message: "Please write password." });
//   }

//   //hashing
//   let hash = await bcrypt.hash(request.body.password, 10); //50ms 정도 걸려여
//   console.log(hash); //salt(뒤에 붙는 랜덤 문자값) + hash값이 나옴. 딴데 분리해서 저장하면 pepper가 됨여. 귀엽다.

//   await db.collection("users").insertOne({
//     username: request.body.username,
//     password: hash,
//   });
//   console.log("user info added on DB");
//   response.redirect("/");
// });

// app.get("/login", (request, response) => {
//   console.log(request.user);
//   response.render("login.ejs");
// });

// app.post("/login", async (request, response, next) => {
//   console.log("login button pressed");

//   passport.authenticate("local", (error, user, info) => {
//     console.log("passport auth start");
//     if (error) {
//       console.log("server error");
//       return response.status(500).json(error);
//     }
//     if (!user) {
//       console.log("invalid username or password");
//       return response.status(401).json(info.message);
//     }
//     request.logIn(user, (err) => {
//       if (err) {
//         console.log("server error 2");
//         return next(err);
//       }
//       console.log("just before the page redirects");
//       response.redirect("/");
//     });
//   })(request, response, next);
// });
