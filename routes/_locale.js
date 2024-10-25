// const i18n = require("i18n");

// i18n.configure({
//     locales: ["en-US", "ko-KR"],
//     directory: path.join(__dirname, "/locales"),
//     defaultLocale: "en-US",
//     cookie: "lang",
//     queryParameter: "lang",
//   });

// app.use(i18n.init); // i18n 미들웨어 추가

// //-----------------------------------------------

// app.get("/change-lang/:lang", (request, response) => {
//     //언어 설정 변경
//     console.log(request.params.lang);
//     const lang = request.params.lang;
//     response.cookie("lang", lang, {
//       maxAge: Number(process.env.LANG_EXPIRY),
//       httpOnly: false,
//     });
//     response.redirect("/");
//   });
// //--------------------------------------------

// app.get("/", (request, response) => {
//     console.log("current language setting: ", request.getLocale());
//     response.render("index.ejs");
//   });
