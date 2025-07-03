
const express = require('express');
const router = express.Router();
const { loggedin, ensureRole } = require('../middlewares/identification');
const userController = require('../controllers/userController');

const { 
    validateCreateUser, 
    validateUpdateUser, 
    validateUpdateMe,
    validateUpdateMyPassword,
    validateUserIdInParams
} = require('../validators/userValidator');

const { handleValidationErrors } = require('../middlewares/validationHandler');


// === CÁC ROUTE QUẢN LÝ CÁ NHÂN ===
router.get('/me', loggedin, userController.getMe);

router.patch(
    '/updateMe', 
    loggedin, 
    validateUpdateMe, // Kiểm tra dữ liệu gửi lên
    handleValidationErrors, // Xử lý nếu có lỗi validation
    userController.updateMe
);

router.patch(
    '/updateMyPassword',
    loggedin,
    validateUpdateMyPassword,
    handleValidationErrors,
    userController.updateMyPassword
);

router.delete('/deleteMe', loggedin, ensureRole(['customer', 'provider']), userController.deleteMe);




// === CÁC ROUTE QUẢN LÝ DÀNH CHO ADMIN ===

router.get(
    '/', 
    loggedin, 
    ensureRole(['admin']), 
    userController.getAllUsers
);

router.get(
    '/:id', 
    loggedin, 

    ensureRole(['admin']), 
    userController.getUserById
);

router.post(
    '/', 
    loggedin, 
    ensureRole(['admin']), 
   
    userController.createUser
);

router.patch(
    '/:id', 
    loggedin, 
    ensureRole(['admin']),
    userController.updateUser
);

router.delete(
    '/:id', 
    loggedin, 
    ensureRole(['admin']), 
    userController.deleteUser
);

module.exports = router;


