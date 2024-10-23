const express = require('express');
const i18n = require('i18n');
const path = require('path');
const app = express();

i18n.configure({
    locales: ['en', 'ko'],
    directory: path.join(__dirname, '/locales'),
    defaultLocale: 'en',
    cookie: 'lang', // 사용자가 언어를 선택할 때 설정할 쿠키 이름
    queryParameter: 'lang' // URL 쿼리 파라미터로 언어를 설정할 때 사용할 파라미터 이름
  });
  
app.use(i18n.init); // i18n 미들웨어 추가

app.set('view engine', 'ejs')

app.listen(8080, () => {
    console.log('listening on 8080: http://localhost:8080')
})

app.get('/', (request, response) => {
    response.render('index.ejs')
})

app.get('/login', (request, response) => {
    response.render('login.ejs')
})

app.get('/change-lang/:lang', (request, response) => { //언어 설정 변경
    const lang = request.params.lang;
    response.cookie('lang', lang, {maxAge: 100000, httpOnly: true});
    response.redirect('back');
})