// src/routers/bookingRouter.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { loggedin, ensureRole } = require('../middlewares/identification');
const { validateLockSeat, validateConfirmBooking } = require('../validators/bookingValidator');
const { handleValidationErrors } = require('../middlewares/validationHandler');
const { isProvider } = require('../middlewares/roleMiddleware');

const { valid } = require('joi');



router.post(
    '/lock', 
    loggedin, 
    ensureRole(['customer']), 
    validateLockSeat,       
    handleValidationErrors, 
    bookingController.lockSeat
);

router.post(
    '/confirm', 
    loggedin, 
    ensureRole(['customer']), 
    validateConfirmBooking, 
    handleValidationErrors, 
    bookingController.confirmBooking
);

router.patch(
    '/:bookingId/approve',
    loggedin,
    ensureRole(['provider']),
    isProvider,
    bookingController.approveBooking
);

module.exports = router;