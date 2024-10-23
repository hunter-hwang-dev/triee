require('dotenv').config();

const express = require('express');
const i18n = require('i18n');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

//request.body 미리 풀어줘요.
app.use(express.json())
app.use(express.urlencoded({extended:true})) 

const dbUri = process.env.DB_URI;

i18n.configure({
    locales: ['en-US', 'ko-KR'],
    directory: path.join(__dirname, '/locales'),
    defaultLocale: 'en-US',
    cookie: 'lang',
    queryParameter: 'lang'
  })
  
app.use(cookieParser()); //왜 그런진 모르겠지만 init 아래로 내리니까 안되더라 조심!
app.use(i18n.init); // i18n 미들웨어 추가
app.set('view engine', 'ejs');

//MongoDB 셋팅
const { MongoClient, ObjectId } = require('mongodb');
let db;
const url = dbUri;
new MongoClient(url).connect().then((client)=> {
    console.log('DB connected');
    db = client.db('trieeDB');

    app.listen(8080, () => {
        console.log('listening on 8080: http://localhost:8080');
    })
    
}).catch((err)=> {
    console.log(err);
})

//--------------------------------------------------------------
//session passport login 가져오기 시작
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

app.use(passport.initialize());
app.use(session({
  secret: '암호화에 쓸 비번', //털리면 큰일나요!
  resave : false,
  saveUninitialized : false,
  cookie : { maxAge : 1000 * 60 * 60 } //session cookie 1시간 유지
}))
app.use(passport.session());


passport.use(new LocalStrategy(async (usernameInput, passwordInput, cb) => {
    let result = await db.collection('users').findOne({ username : usernameInput});
    if (!result) {
      return cb(null, false, { message: 'invalid username' }); //i18n.t(errors_usernameNotFound)
    }
    if (result.password == passwordInput) {
      return cb(null, result);
    } else {
      return cb(null, false, { message: 'invalid password' }); //i18n.t(errors_passwordMismatch)
    }
  }))

passport.serializeUser((user, done) => {
  console.log(user);
  process.nextTick(() => { //node.js에서 내부 코드 비동기적으로 처리 - 너무 길어지면 괄호 안에 있는 것 다음에
    done(null, { id: user._id, username: user.username });
  })
})

passport.deserializeUser( async(user, done) => { //cookie 분석 > 어디서든 request.user 사용 가능하게 해줍니다.
  let result = await db.collection('users').findOne({_id: new ObjectId(user.id)})
  delete result.password; //비번은 삭제
  process.nextTick(() => { 
    return done(null, result);
  })
})
//session passport login 가져오기 끝
//--------------------------------------------------------------

app.get('/', (request, response) => {
    console.log("current language setting: ", request.getLocale());
    response.render('index.ejs');
})

app.get('/signup', (request, response) => {
  response.render('signup.ejs');
})

app.post('/signup', async (request, response) => {
  //서버에 계정 정보 추가하기
  console.log(request.body);
  //빈칸 체크
  if (request.body.username == '') {
    return response.status(400).send({ message: "Please write username."});
  }
  else if (request.body.password == '') {
    return response.status(400).send({ message: "Please write password."});
  }
  //
  await db.collection('users').insertOne({
    username: request.body.username ,
    password: request.body.password })
    console.log('user info added on DB');
    response.redirect('/');
})

//-------------------------------------------------------------------------

app.get('/login', (request, response) => {
    console.log(request.user);
    response.render('login.ejs');
})

app.post('/login', async (request, response, next) => {
  console.log('login button pressed');

  passport.authenticate('local', (error, user, info) => {
    console.log('passport auth start');
    if (error) {
      console.log('server error');
      return response.status(500).json(error);
    }
    if (!user) {
      console.log('invalid username or password')
      return response.status(401).json(info.message);
    }
    request.logIn(user, (err) => {
      if (err) {
        console.log('server error 2')
        return next(err);
      }
      console.log('just before the page redirects')
      response.redirect('/');
    })
  })(request, response, next)

})


app.get('/change-lang/:lang', (request, response) => { //언어 설정 변경
    console.log(request.params.lang);
    const lang = request.params.lang;
    response.cookie('lang', lang, {maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: false}); //밀리초 단위 > 7일 쿠키
    response.redirect("/");
})