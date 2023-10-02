const router = require('express').Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/s3Config');  // import your S3 config
const meowController = require('../controllers/meowController');

//new
const shortId = require('shortid');
///

// Configure multer to use s3 storage
// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.S3_BUCKET,
//     key: function (req, file, cb) {
//       cb(null, Date.now().toString())
//     }
//   })
// });
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    // acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, shortId.generate() + '-' + file.originalname);
    },
  }),
});

// Insert `upload.single('meowMedia')` as a middleware before `meowController.createMeow`
router.post('/', upload.single('meowMedia'), meowController.createMeow);

router.get('/:meowId', meowController.getMeow);
router.put('/:meowId', meowController.updateMeow);
router.delete('/:meowId', meowController.deleteMeow);
router.get('/', meowController.getAllMeows);

module.exports = router;

// const router = require('express').Router();
// const meowController = require('../controllers/meowController');

// router.post('/', meowController.createMeow);

// router.get('/:meowId', meowController.getMeow);

// router.put('/:meowId', meowController.updateMeow);

// router.delete('/:meowId', meowController.deleteMeow);

// router.get('/', meowController.getAllMeows);

// module.exports = router;
