// The purpose of this file is to create a Mongoose Schema of a review. 
// This Review model has a 1 to many relationship 
// i.e - 1 campground can have multiple reviews 

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String, 
    rating: Number, 
    author: {
        type: Schema.Types.ObjectId, 
        ref: "User"
    }
});

module.exports = mongoose.model("Review", reviewSchema);