/* 
    process.env.NODE_ENV - is an enviornment variable that is usually just development or production 
    if we are running in developement mode, require the dotenv package it will take 
    the variables defined in the .env file and add them into process.env in the node app 
    so it can be access throughout all files 
*/
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash"); // this is to set up messages such as "welcome back", "thanks for signing up"
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override"); // needed so we can update a single campground 
const passport = require("passport"); // allows us to plugin multiple strategies for authentication
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");

const mongoSanitize = require('express-mongo-sanitize'); // this packaage helps prevent mongoDB Operator Injection  


// Models - Mongoose Schemas for Campgrounds and Reviews 
const Campground = require("./models/campground");
const Review = require("./models/review");

// Routes - Requiring routes for Campground and Reviews routes
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

const MongoDBStore = require("connect-mongo")(session);

const dbUrl = "mongodb://localhost:27017/yelp-camp"; //process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
// const dbUrl = "mongodb://localhost:27017/yelp-camp";
// Mongoose Connection to yelp-camp DB
// "mongodb://localhost:27017/yelp-camp"
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

// Verifying that the connection was successfull 
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);

// Setting up the Views 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(express.urlencoded({ extended: true })); // for parsing the html body
app.use(methodOverride("_method")); // using this for our query string 
app.use(express.static(path.join(__dirname, "public"))); // used for static assets
app.use(mongoSanitize({
    replaceWith: '_'
}));

const secret = process.env.SECRET || "thisshouldbeabettersecret!";

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
});

const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        // Date.Now is expressed in miliseconds, so it is required that this expires 
        // in a week. So to do that we do 1000 miliseconds/sec * 60 sec/min * 60min/hr * 24hr/day * 7days/week  
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dias9juma/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Thi is for persistent login 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // authenticate() is coming from mogoose-local-passport 

passport.serializeUser(User.serializeUser()); // serialization is how we store a user in a session 
passport.deserializeUser(User.deserializeUser()); // how we unstore a user out of that session 

// Middleware for Flash 
app.use((req, res, next) => {
    // console.log(req.session); 
    res.locals.currentUser = req.user; // req.user comes from passport 
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});


// Setting up Routes for Campgrounds and Reviews 
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);


app.get("/", (req, res) => {
    res.render("home");
});


app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// error handler 
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong!";
    res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
    // console.log("serving");
});