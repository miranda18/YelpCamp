// The purpose of this file is to make the model for the campground 
const mongoose = require("mongoose");
const Review = require("./review");

// creating a shortcut, so dont have to type mongoose.Schema each time
// i.e mongoose.Schema.Types."somethingelse", would just do: 
// Schema.Types."somethingelse" instead 
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String

}); 

// we use virtual since we do not need to store this in our database 
// The below is for changing all images to a certain size 
ImageSchema.virtual("thumbnail").get(function(){
    return this.url.replace("/upload", "/upload/w_200");
});

const opts = {toJSON: {virtuals: true}}; 

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String, 
            enum: ["Point"], 
            required: true
        }, 
        coordinates: {
            type: [Number], 
            required: true
        }    
    }, 
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [ // this is connecting to the Review model 
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts);

// We created a virtual description in order to be able 
// to add information on a single thumbnail of the cluster map 
CampgroundSchema.virtual("properties.popUpMarkup").get(function(){
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
            <p>${this.location}</p>
            <p>${this.description.substring(0,20)}...</p>`;
});

// Mongoose Delete Middleware 
CampgroundSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

module.exports = mongoose.model("Campground", CampgroundSchema);

