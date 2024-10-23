const express = require('express');
const i18n = require('i18n');
const path = require('path');
const app = express();

i18n.configure({
    locales: ['en-US', 'ko-KR'],
    directory: path.join(__dirname, '/locales'),
    defaultLocale: 'en-US',
    cookie: 'lang',
    queryParameter: 'lang'
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
    console.log(request.params.lang);
    const lang = request.params.lang;
    response.cookie('lang', lang, {maxAge: 1000000, httpOnly: true});
    response.location(request.get("Referrer") || "/");
})