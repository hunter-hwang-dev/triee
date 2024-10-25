// const bcrypt = require("bcrypt");

// //--------------------------------------------------------
// //multer multer-s3 @aws-sdk/client-s3으로 AWS에 업로드
// const { S3Client } = require("@aws-sdk/client-s3");
// const multer = require("multer");
// const multerS3 = require("multer-s3");
// const s3 = new S3Client({
//   region: "ap-northeast-2",
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: "nunupedia", //버킷 이름
//     key: function (request, file, cb) {
//       cb(null, Date.now().toString()); //업로드시 파일명 변경가능. 이름 겹치면 안됨. 요청.file 하면 파일명도 사용 가능.
//     },
//   }),
// });
// //--------------------------------------------------------
