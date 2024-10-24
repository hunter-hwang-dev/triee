//여러 router에서 db 접근 가능 + 상호참조 안되도록 따로 뺌
const { MongoClient } = require('mongodb');

const url = process.env.DB_URL;
let connectDB = new MongoClient(url).connect()

module.exports = connectDB //이러면 5째 줄까지 쭉 connectDB 선언하는데 사용됐고, 그 값이 server.js에서 열릴 거임.