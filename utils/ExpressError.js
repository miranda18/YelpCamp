class ExpressError extends Error{
    // calls the Error constructor 
    constructor(message, statusCode){
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;