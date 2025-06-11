const express = require('express');
const router = express.Router();
const {adminOnly, loggedin} = require('../middlewares/identification');



const authController = require('../controllers/authController');




router.post('/logout', loggedin , authController.logout);
router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.patch('/send-verification-code', loggedin, authController.sendVerificationCode);
router.patch('/verify-verification-code',   loggedin,  authController.verifyVerificationCode);

router.patch('/send-reset-password-code', authController.sendResetPasswordCode);
router.patch('/verify-reset-password-code', authController.verifyResetPasswordCode);



router.get('/verifiedStatus', loggedin, authController.verifiedStatus )
router.get('/admintest', loggedin , adminOnly, (req, res) => {
    res.json({ success: true, message: 'Admin test successful' });
});
module.exports = router;