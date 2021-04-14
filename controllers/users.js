// The purpose of this file is to implement logic for the users routes 
const User = require("../models/user");

// renders the registration page 
module.exports.renderRegister = (req, res) => {
    res.render("users/register");
}

// register a new user to YelpCamp and saves them to the DB
module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        // this req.login() logs the user in right after they sign up 
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash("success", "Welcome to YelpCamp!");
            res.redirect("/campgrounds");
        }); 
    } catch (e) {
        req.flash("error", e.message + ". Please try again.");
        res.redirect("register");
    }
}

// renders the login form 
module.exports.renderLogin = (req, res) => {
    res.render("users/login");
}

// logs the user in 
module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!");
    // "redirectUrl" - is checking if the user was trying to do something prior to signing in 
    // if they weren't and they were trying to sign in normally, they will get redirected to "/campgroudns"
    const redirectUrl = req.session.returnTo || "/campgrounds";  
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash("success", "Successfully logged out!");
    res.redirect("/campgrounds");
}