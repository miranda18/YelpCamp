const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const passport = require("passport");

// controller
const users = require("../controllers/users");

router.route("/register")
    // renders the refistration page
    .get(users.renderRegister)
    // This route is to register a new user to YelpCamp
    .post(catchAsync(users.register));

router.route("/login")
    // serves the form that the user uses to login 
    .get(users.renderLogin)
    // submits user's data to login them in/ makes sure the credentials are 
    // valid. 
    .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), users.login);

// route for the user to logout 
router.get("/logout", users.logout);


module.exports = router;