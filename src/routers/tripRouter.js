const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { loggedin, ensureRole } = require('../middlewares/identification');
const { isProvider } = require('../middlewares/roleMiddleware');
const { handleValidationErrors } = require('../middlewares/validationHandler');
// THÊM IMPORT VALIDATOR
const {
    validateSearchTrip,
    validateCreateTrip,
    validateUpdateTrip
} = require('../validators/tripValidator');

// Middleware chung cho các route cần quyền admin hoặc provider
const authAccess = [loggedin, ensureRole(['admin', 'provider']), isProvider];

// === CÁC ROUTE CÔNG KHAI ===
router.get(
    '/search',
    validateSearchTrip,
    handleValidationErrors,
    tripController.searchTrips
);

// === CÁC ROUTE CẦN XÁC THỰC ===
router.route('/')
    .get(
        authAccess,
        tripController.getAllTrips
    )
    .post(
        [loggedin, ensureRole(['provider']), isProvider], // Chỉ provider được tạo
        validateCreateTrip,
        handleValidationErrors,
        tripController.createTrip
    );

router.route('/:id')
    .get(
        authAccess,
        tripController.getTripById
    )
    .patch(
        authAccess,
        validateUpdateTrip,
        handleValidationErrors,
        tripController.updateTrip
    )
    .delete(
        authAccess,
        tripController.deleteTrip
    );

module.exports = router;