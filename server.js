const express = require('express');
const i18n = require('i18n');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

i18n.configure({
    locales: ['en-US', 'ko-KR'],
    directory: path.join(__dirname, '/locales'),
    defaultLocale: 'en-US',
    cookie: 'lang',
    queryParameter: 'lang'
  });
  
app.use(cookieParser());
app.use(i18n.init); // i18n 미들웨어 추가

app.set('view engine', 'ejs')

//MongoDB 셋팅
const { MongoClient } = require('mongodb')
let db
const url = '' //향후 저장되지 않는 보안 폴더로 옮길 것.
new MongoClient(url).connect.then((client)=> {
    console.log('DB connected')
    db = client.db('trieeDB')

    app.listen(8080, () => {
        console.log('listening on 8080: http://localhost:8080')
    })
    
}).catch((err)=> {
    console.log(err)
})



app.get('/', (request, response) => {
    console.log("현재 언어 설정: ", request.getLocale());
    response.render('index.ejs')
})

app.get('/login', (request, response) => {
    response.render('login.ejs')
})

app.get('/change-lang/:lang', (request, response) => { //언어 설정 변경
    console.log(request.params.lang);
    const lang = request.params.lang;
    response.cookie('lang', lang, {maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: false}); //밀리초 단위 > 7일 쿠키
    response.redirect("/");
})