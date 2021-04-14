/* The purpose of this file is to implement all logic for our campgrounds routes */
const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken}); // contains forward and reverse geocode 
const { cloudinary } = require("../cloudinary");

// used to list all the campgrounds in DB
module.exports.index = async (req, res) => {
    // finds all campgrounds 
    const campgrounds = await Campground.find({});
    // pass info into templates 
    res.render("campgrounds/index", { campgrounds });
}

// rendering the form to create a new campground 
module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

// inputting a new campground in to the DB
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location, 
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename })); // this is done using multer
    campground.author = req.user._id; // saves the user who created a new campground 
    await campground.save();
    console.log(campground);
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
}

// list details of a single campground  
module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author");
    // console.log(campground);
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
}

// reodering the form to edit the campground 
module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash("error", "Cannot find that campground to edit!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
}

//edits a campground and updates the DB
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        console.log(campground);
    }

    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
}

// Route for deleting a single campground 
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground.");
    res.redirect("/campgrounds");
}