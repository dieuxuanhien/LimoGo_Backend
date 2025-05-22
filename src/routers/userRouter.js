const express = require('express');
const router = express.Router();
const {adminOnly, loggedin} = require('../middlewares/identification');
const userController = require('../controllers/userController');



router.get('/me', loggedin, userController.getMe);
router.put('/updateMe', loggedin, userController.updateMe);


module.exports = router;