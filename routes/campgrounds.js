// The purpose of this file is to create routes for campgrounds. It helps in reducing 
// amount of code in the app.js file  
const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const multer = require("multer");
const {storage} = require("../cloudinary");
const upload = multer({storage});

const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

const Campground = require("../models/campground");

router.route("/")
    // route to list all the campgrounds in DB
    .get(catchAsync(campgrounds.index))
    // inputting a new campground in to the DB
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground));
    

// rendering the form to create a new campground 
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route("/:id")
    // route to list details of a single campground  
    .get(catchAsync(campgrounds.showCampground))
    // edits a campground and updates the DB
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
    // Route for deleting a single campground 
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));


// route to edit the campground details 
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router; 