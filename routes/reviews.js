// The purpose of this file is to create routes for campgrounds. It helps in reducing 
// amount of code in the app.js file  
const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

// Models - Mongoose Schemas 
const Campground = require("../models/campground");
const Review = require("../models/review");

// controller 
const reviews = require("../controllers/reviews");

const { campgroundSchema, reviewSchema } = require("../schemas.js"); // Joi Schemas 

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

// Post route to submit a review 
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

// Delete Route to delete a review 
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router; 