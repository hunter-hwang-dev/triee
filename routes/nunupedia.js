const router = require('express').Router()

//db가 server.js에 있는 걸 가지고 오는 법? 상호참조는 안좋아요.
let connectDB = require('./../database.js') //상위 폴더니깐

let db;
connectDB.then((client)=> { //오래 걸리는 건 export하기보단 server.js에 담는 것이 나음.
  console.log('DB connected');
  db = client.db('trieeDB');

  app.listen(process.env.PORT, () => {
      console.log('서버 실행중: ' + 'http://localhost:' + process.env.PORT);
  })
  
}).catch((err)=> {
  console.log(err);
})
//-----------------------------------------------------------------------------------------

router.get('/hello', async (req, res) => {
    await db.collection('users').find().toArray()
    res.send('안녕 반가워')
})

router.get('/bye', (req, res) => {
    res.send('안녕 잘가')
})

module.exports = router