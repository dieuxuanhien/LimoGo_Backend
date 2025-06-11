const express = require('express');
const router = express.Router();
const {adminOnly, loggedin} = require('../middlewares/identification');
const userController = require('../controllers/userController');



router.get('/me', loggedin, userController.getMe);
router.patch('/updateMe', loggedin, userController.updateMe);
router.delete('/deleteMe', loggedin, userController.deleteMe); 

module.exports = router;