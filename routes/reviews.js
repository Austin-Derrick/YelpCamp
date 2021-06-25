const express = require('express');
const Review = require('../models/review');
const Campground = require('../models/campground');
const reviews = require('../controllers/reviews');

const catchAsync = require('../utils/catchAsync');
const router = express.Router({mergeParams: true});

const {isLoggedIn, validateReview, isReviewAuthor} = require('../middleware.js');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;