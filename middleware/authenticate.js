const jwt = require('jsonwebtoken');
const UnauthenticatedError= require('../errors/Unauthenticated');

const authenticate = async (req, res, next) => {
    // check header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        throw new UnauthenticatedError('Authentication invalid');
    }

    //verify token
    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // attach the user to the book routes
        req.user = { email:payload.email,id:payload.id };
        next();
    } catch (error) {
        throw new UnauthenticatedError('Authentication invalid');
    }
};

module.exports = authenticate;