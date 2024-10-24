require('dotenv').config();

const express = require('express');
const i18n = require('i18n');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();

const bcrypt = require('bcrypt');


//--------------------------------------------------------
//multer multer-s3 @aws-sdk/client-s3으로 AWS에 업로드
const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const s3 = new S3Client({
  region : 'ap-northeast-2',
  credentials : {
      accessKeyId : process.env.AWS_ACCESS_KEY,
      secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY
  }
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'nunupedia', //버킷 이름
    key: function (request, file, cb) {
      cb(null, Date.now().toString()) //업로드시 파일명 변경가능. 이름 겹치면 안됨. 요청.file 하면 파일명도 사용 가능.
    }
  })
})
//--------------------------------------------------------


//request.body 미리 풀어줘요.
app.use(express.json())
app.use(express.urlencoded({extended:true})) 

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
const url = process.env.DB_URL;
new MongoClient(url).connect().then((client)=> {
    console.log('DB connected');
    db = client.db('trieeDB');

    app.listen(process.env.PORT, () => {
        console.log('서버 실행중: ' + 'http://localhost:' + process.env.PORT);
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
  secret: process.env.SESSION_SECRET, //털리면 큰일나요!
  resave : false,
  saveUninitialized : false,
  cookie : { maxAge : Number(process.env.SESSION_EXPIRY) }
}))
app.use(passport.session());


passport.use(new LocalStrategy(async (usernameInput, passwordInput, cb) => {
    let result = await db.collection('users').findOne({ username : usernameInput});
    if (!result) {
      return cb(null, false, { message: 'invalid username' }); //i18n.t(errors_usernameNotFound)
    }

    //result.password는 가입 시 hash되어 DB에 저장.
    if (await bcrypt.compare(passwordInput, result.password)) {
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
  //서버에 계정 정보 추가하기 = 회원가입
  
  //빈칸 exception
  if (request.body.username == '') {
    return response.status(400).send({ message: "Please write username."});
  }
  else if (request.body.password == '') {
    return response.status(400).send({ message: "Please write password."});
  }

  //hashing
  let hash = await bcrypt.hash(request.body.password, 10) //50ms 정도 걸려여
  console.log(hash) //salt(뒤에 붙는 랜덤 문자값) + hash값이 나옴. 딴데 분리해서 저장하면 pepper가 됨여. 귀엽다.

  await db.collection('users').insertOne({
    username: request.body.username ,
    password: hash })
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
    response.cookie('lang', lang, {maxAge: Number(process.env.LANG_EXPIRY), httpOnly: false});
    response.redirect("/");
})

//---------------------------------------------------------------------------------------------------
//----제대로 Thinkbud, Triee 나타난다 와 선밴님. 코드를 찢어 놓으셨다.----------------------------------
//---------------------------------------------------------------------------------------------------

app.get('/budding', (request, response) => {
  response.render('budding.ejs');
})

app.post('/budding', upload.array('img1', 4), (request, response) => { //최대 이미지 갯수... 미들웨어로 끼워팔기 해줍시당.
  console.log(request.body.cell);
  console.log(request.file.location); //location url

  response.redirect("/");
})

//---------------------------------------------------------------------------------------------------
//라우터 갖고오기-------------------------------------------------------------------------------------

app.use('/', require('./routes/nunupedia.js'));
