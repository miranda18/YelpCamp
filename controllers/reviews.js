// The purpose of this file is to implement logic for the reviews routes 

// Models - Mongoose Schemas 
const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); // in our show.ejs we created a name of review[rating] and gave them a key of review
    review.author = req.user._id; // saving the current user to the newly created review 
    campground.reviews.push(review); // pushes this to the reviews we made in the campground Schema 
    await review.save();
    await campground.save();
    req.flash("success", "Successfully created new review!");
    res.redirect(`/campgrounds/${campground._id}`);
}

// Deletes a review 
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review");
    res.redirect(`/campgrounds/${id}`);
}