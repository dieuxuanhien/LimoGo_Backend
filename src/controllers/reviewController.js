const Review = require('../models/review');

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().populate('user', 'name').populate('trip', 'name');
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id).populate('user', 'name').populate('trip', 'name');
        if (!review) res.status(404).json({ message: 'Review not found' });
        res.json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createReview = async (req, res) => {
    try {
        if (!req.body.trip || !req.body.rating || !req.body.desc) {
            return res.status(400).json({ message: 'Trip, rating, and description are required' });
        }
        const newReview = new Review({
            user: req.user.id,
            trip: req.body.trip,
            rating: req.body.rating,
            desc: req.body.desc,
        });
        const review = await newReview.save();
        res.json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!review) res.status(404).json({ message: 'Review not found' });
        res.json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) res.status(404).json({ message: 'Review not found' });
        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



exports.getReviewsByTripId = async (req, res) => {
    try {
        const reviews = await Review.find({ trip: req.params.tripId }).populate('user', 'name');
        if (!reviews.length) return res.status(404).json({ message: 'No reviews found for this trip' });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getReviewsByUserId = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.params.userId }).populate('trip', 'name');
        if (!reviews.length) return res.status(404).json({ message: 'No reviews found for this user' });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};