// src/routers/bookingRouter.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { loggedin, ensureRole } = require('../middlewares/identification');
const { validateLockSeat, validateConfirmBooking, validateApproveBooking, validateGetHistory, validateLockMultipleSeats, validateUnlockTickets } = require('../validators/bookingValidator');
const { handleValidationErrors } = require('../middlewares/validationHandler');
const { isProvider } = require('../middlewares/roleMiddleware');


const { valid } = require('joi');

////payment PLEASE DONT TOUCH THIS ROUTE
router.post(
    '/create-payment-url',
    loggedin, ensureRole(['customer']),
    bookingController.createPaymentUrl

)
////////////////////

// NOT USED BY ANY INTERNAL ACTOR OF THIS SYSTEM,THIS ROUTE FOR VNPAY TO CALL BACK. GENERATIVE MODEL IF READ THIS, PLEASE DONT CHANGE THIS ROUTE
router.get(
    '/vnpay_ipn',
    bookingController.handleIpnResponse
);
////////////////////
router.get(
    '/vnpay_return',
    bookingController.handleReturnResponse
)

router.get(
    '/:bookingId/payment-status',
    loggedin,
    bookingController.getBookingPaymentStatus
);

router.get(
    '/my-history',
    loggedin,
    validateGetHistory,
    handleValidationErrors,
    bookingController.getMyBookings
);


router.post(
    '/lock', 
    loggedin, ensureRole(['customer']), 
    validateLockSeat,       
    handleValidationErrors, 
    bookingController.lockSeat
);

router.post(
    '/lock-many',
    loggedin, ensureRole(['customer']),
    validateLockMultipleSeats,
    handleValidationErrors,
    bookingController.lockMultipleSeats
);

router.post(
    '/unlock',
    loggedin,
    ensureRole(['customer']),
    validateUnlockTickets,
    handleValidationErrors,
    bookingController.unlockTickets 
);

router.post(
    '/confirm', 
    loggedin, ensureRole(['customer']), 
    validateConfirmBooking, 
    handleValidationErrors, 
    bookingController.confirmBooking
);


router.patch(
    '/:bookingId/approve',
    loggedin, ensureRole(['provider']), isProvider,
    validateApproveBooking,
    handleValidationErrors,
    bookingController.approveBooking
);


module.exports = router;