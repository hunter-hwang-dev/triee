require('dotenv').config();

const express = require('express');
const i18n = require('i18n');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

const dbUri = process.env.DB_URI;

i18n.configure({
    locales: ['en-US', 'ko-KR'],
    directory: path.join(__dirname, '/locales'),
    defaultLocale: 'en-US',
    cookie: 'lang',
    queryParameter: 'lang'
  });
  
app.use(cookieParser()); //왜 그런진 모르겠지만 init 아래로 내리니까 안되더라 조심!
app.use(i18n.init); // i18n 미들웨어 추가
app.set('view engine', 'ejs')

//MongoDB 셋팅
const { MongoClient } = require('mongodb')
let db
const url = dbUri;
new MongoClient(url).connect().then((client)=> {
    console.log('DB connected')
    db = client.db('trieeDB')

    app.listen(8080, () => {
        console.log('listening on 8080: http://localhost:8080')
    })
    
}).catch((err)=> {
    console.log(err)
})

//--------------------------------------------------------------
//session passport login 가져오기 시작
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

app.use(passport.initialize())
app.use(session({
  secret: '암호화에 쓸 비번', //털리면 큰일나요!
  resave : false,
  saveUninitialized : false
}))
app.use(passport.session()) 


passport.use(new LocalStrategy(async (usernameInput, passwordInput, cb) => {
    let result = await db.collection('users').findOne({ username : usernameInput})
    if (!result) {
      return cb(null, false, { message: i18n.t('errors_usernameNotFound') })
    }
    if (result.password == passwordInput) {
      return cb(null, result)
    } else {
      return cb(null, false, { message: i18n.t('errors_passwordMismatch') });
    }
  }))
//session passport login 가져오기 끝
//--------------------------------------------------------------

app.get('/', (request, response) => {
    console.log("현재 언어 설정: ", request.getLocale());
    response.render('index.ejs')
})

app.get('/login', (request, response) => {
    response.render('login.ejs')
})

app.post('/login', async (request, response, next)=>{
    passport.authenticate('local', (error, user, info) => {
      if (error) return response.status(500).json(error);
      if (!user) return response.status(401).json(info.message); //info.message는 상단에 선언
      request.logIn(user, (err) => { //session 생성
        if (err) return next(err);
        response.redirect('/') // 로그인 완료 시 리다이렉트
      }) 

    })(request, response, next)

})

app.get('/change-lang/:lang', (request, response) => { //언어 설정 변경
    console.log(request.params.lang);
    const lang = request.params.lang;
    response.cookie('lang', lang, {maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: false}); //밀리초 단위 > 7일 쿠키
    response.redirect("/");
})