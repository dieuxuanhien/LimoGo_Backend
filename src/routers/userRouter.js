
const express = require('express');
const router = express.Router();
const { loggedin } = require('../middlewares/identification');
const userController = require('../controllers/userController');

router.get('/me', loggedin, userController.getMe);
router.patch('/updateMe', loggedin, userController.updateMe);
router.delete('/deleteMe', loggedin, userController.deleteMe); 



router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/create-user', userController.createUser);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);


module.exports = router;