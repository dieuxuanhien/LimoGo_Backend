const express = require('express');
const router = express.Router();

const itineraryController = require('../controllers/itineraryController');
const { loggedin, ensureRole } = require('../middlewares/identification');
const { isProvider } = require('../middlewares/roleMiddleware');
const { handleValidationErrors } = require('../middlewares/validationHandler');
// THÊM IMPORT VALIDATOR
const { validateItineraryCreation, validateItineraryUpdate } = require('../validators/itineraryValidator');
const { valid } = require('joi');

router.use(loggedin, ensureRole(['provider']), isProvider);

    router.route('/')
        .get(itineraryController.getAllItineraries)
        .post(
            validateItineraryCreation,
            handleValidationErrors,
            itineraryController.createItinerary
        );

router.route('/:id')
    .get(itineraryController.getItineraryById)
    .patch(
        validateItineraryUpdate,
        handleValidationErrors,
        itineraryController.updateItinerary
    )
    .delete(itineraryController.deleteItinerary);

module.exports = router;