
const express = require('express');
const router = express.Router();
const { loggedin, ensureRole } = require('../middlewares/identification');
const userController = require('../controllers/userController');

router.get('/me', loggedin, userController.getMe);
router.patch('/updateMe', loggedin, userController.updateMe);
router.delete('/deleteMe', loggedin, userController.deleteMe); 



router.get('/', loggedin, ensureRole(['admin']), userController.getAllUsers);
router.get('/:id', loggedin, ensureRole(['admin']), userController.getUserById);
router.post('/create-user', loggedin, ensureRole(['admin']), userController.createUser);
router.patch('/:id', loggedin, ensureRole(['admin']), userController.updateUser);
router.delete('/:id', loggedin, ensureRole(['admin']), userController.deleteUser);


module.exports = router;