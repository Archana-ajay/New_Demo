const BadRequestError = require('../errors/bad-request');
const jwt = require('jsonwebtoken');

exports.generateAccessToken = (payload) => {
    return jwt.sign({ email:payload },process.env.JWT_SECRET ,{
        expiresIn :  process.env.JWT_LIFETIME
    });
};

exports.verifyToken = (token) => {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
        jwt.verify(token,process.env.JWT_SECRET,(err,decoded) => {
            if (err) throw new BadRequestError('Invalid Token');
            resolve(decoded);
        });
    });
};

