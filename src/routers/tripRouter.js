const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const route = require('../models/route');

const { validatorSearchTrip, handleValidationErrors } = require('../validators/tripValidator');

router.get(
    '/search', 
    validatorSearchTrip,
    handleValidationErrors,
    tripController.searchTripsByCity
);

module.exports = router;