const router = require('express').Router();
const authController = require('../controllers/authController');

const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/s3Config');

const shortId = require('shortid');

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];

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

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/register', authController.register);
router.put('/editRealName', authController.editRealName);
router.get('/dateJoined', authController.dateJoined);
router.get('/bio', authController.bio);
router.get('/location', authController.location);
router.put('/editBio', authController.editBio);
router.put('/editLocation', authController.editLocation);
router.get('/profilePhoto', authController.profilePhoto); //
router.put('/editProfilePhoto', upload.single('profilePhoto'), authController.editProfilePhoto);

module.exports = router;
