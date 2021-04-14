module.exports = func => {
    return (req, res, next) =>{
        func(req, res, next).catch(next);
    }
}

// we return a function that excepts a function 
// and then executes that funcrion but catches any erros and passes them to next