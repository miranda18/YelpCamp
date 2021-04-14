const { campgroundSchema, reviewSchema } = require("./schemas.js"); // Joi Schemas 
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");

/* The purpose of this is to implement authentication for user 
    i.e Check that theyre signed in to be able to add in a new campground */
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // "req.session.returnTo = req.originalUrl" - stores the path that the user is going to 
        // we are storing it in order to be able to track where the user was going
        // i.e They were trying to create a new campground without signing in first 
        // once they are prompted to sign in, and login successfully. We will be able to take 
        // them directly back to what they were doing. Improving UX
        req.session.returnTo = req.originalUrl; 
        req.flash("error", "Sorry, you must be signed in first!");
        return res.redirect("/login");
    }
    next();
}

// The purpose of this function is to validate user input for creating a new campground. 
// It acts as error validation middleware 
module.exports.validateCampground = (req, res, next) => {
    // destructoring the error details 
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        // result.error.details is an array, so we are going to map over it, and turn it in
        // to a single string 
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// The purpose of this function is to act as middleware to check if the user
// is the author of what they are trying to edit or delete a campground
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// The purpose of this function is to act as middleware to check if the user
// is the author of when they are trying to edit or delete a review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// the purpose of this function is to validate user input for creating a new review for a 
// campground. It acts as error validation middleware 
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        // result.error.details is an array, so we are going to map over it, and turn it in
        // to a single string 
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

