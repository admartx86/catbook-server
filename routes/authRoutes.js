const router = require('express').Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/register', authController.register);
router.put('/editRealName', authController.editRealName);
router.get('/dateJoined', authController.dateJoined); //

module.exports = router;
