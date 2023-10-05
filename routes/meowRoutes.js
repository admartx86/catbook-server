const router = require('express').Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/s3Config');
const meowController = require('../controllers/meowController');

const shortId = require('shortid');

const allowedMimeTypes = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-ms-wmv',
  'video/x-m4v',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp'
];

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, shortId.generate() + '-' + file.originalname);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

router.post('/', upload.single('meowMedia'), meowController.createMeow);
router.get('/:meowId', meowController.getMeow);
router.put('/:meowId', meowController.updateMeow);
router.delete('/:meowId', meowController.deleteMeow);
router.get('/', meowController.getAllMeows);

module.exports = router;
