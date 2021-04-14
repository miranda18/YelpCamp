// the purpose of this file is to create Joi schemas in order to validate 
// the user's data
const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

// creating a custom extension for joi in order to sanitize user's input
const extension = (joi) => ({
    type: 'string', 
    base: joi.string(), 
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    }, 
    rules: {
        escapeHTML: {
            validate(value, helpers){
                const clean = sanitizeHtml(value, {
                    allowedTags: [], 
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', {value})
                return clean; 
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

// this isn't a mongoose schema this is a schema to validate our data before we involve 
// mongoose 
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
    }).required(), 
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
});