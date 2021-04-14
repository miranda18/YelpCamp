const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

/*
 UserSchema.plugin(passportLocalMongoose):  
 This is going to add on to our Schema a username, a field for 
 password. It will make sure that the usernames are unique and 
 not duplicated. It will also give us access to more methods 
*/
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);