// const AWS = require('aws-sdk');

// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION
// });

// const s3 = new AWS.S3();
// module.exports = s3;

require('dotenv').config();
const { S3Client } = require('@aws-sdk/client-s3');
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // Add more configurations if needed
});

module.exports = s3;
