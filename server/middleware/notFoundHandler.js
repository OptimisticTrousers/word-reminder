const createHttpError = require("http-errors");

// catch 404 and forward to error handler
const notFoundHandler = (req, res, next) => {
    next(createHttpError(404));
}

module.exports = notFoundHandler;