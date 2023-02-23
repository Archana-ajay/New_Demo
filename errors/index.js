const CustomAPIError = require('./custom-api');
const NotFoundError = require('./not-found');
const BadRequestError = require('./bad-request');
const UnauthenticatedError = require('./Unauthenticated');
const UnauthorizedError = require('./Unauthorized');
const TooManyRequestException = require('./max-request');

module.exports = {
    CustomAPIError,
    NotFoundError,
    BadRequestError,
    UnauthenticatedError,
    UnauthorizedError,
    TooManyRequestException,
};
