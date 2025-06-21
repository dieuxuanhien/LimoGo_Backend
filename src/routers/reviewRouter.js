const express = require('express');
const router = express.Router();


const reviewController = require('../controllers/reviewController');
const { loggedin, ensureRole } = require('../middlewares/identification');



router.get('/', loggedin, ensureRole(['admin']), reviewController.getAllReviews);
router.get('/:id', loggedin, reviewController.getReviewById);
router.post('/create-review', loggedin, ensureRole(['user', 'admin']), reviewController.createReview);
router.patch('/:id', loggedin, ensureRole(['user', 'admin']), reviewController.updateReview);
router.delete('/:id', loggedin, ensureRole(['user', 'admin']), reviewController.deleteReview);


// Get reviews by trip ID
router.get('/trip/:tripId', loggedin, reviewController.getReviewsByTripId);
router.get('/user/:userId', loggedin, reviewController.getReviewsByUserId);
module.exports = router;