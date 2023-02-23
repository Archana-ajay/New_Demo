const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('./custom-api');

class TooManyRequestException extends CustomAPIError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.TOO_MANY_REQUESTS;
    }
}

module.exports = TooManyRequestException;
