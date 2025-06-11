const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/adminControllers/userManagementController');

router.get('/', (req, res) => {
    res.json({ success: true, message: 'Admin router is working' });
});


//user management routes
router.get('/users', userManagementController.getAllUsers);
router.get('/users/:id', userManagementController.getUserById);

router.post('/users', userManagementController.createUser);
router.put('/users/:id', userManagementController.updateUser);
router.delete('/users/:id', userManagementController.deleteUser);



module.exports = router;