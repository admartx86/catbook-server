const router = require('express').Router();
const meowController = require('../controllers/meowController');

router.post('/', meowController.createMeow);

router.get('/:meowId', meowController.getMeow);

router.put('/:meowId', meowController.updateMeow);

router.delete('/:meowId', meowController.deleteMeow);

router.get('/', meowController.getAllMeows);

module.exports = router;
