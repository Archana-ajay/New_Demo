const BadRequestError = require('../errors/bad-request');
const { passwordStrength } = require('check-password-strength');
exports.testPasswordStrength = async (req, res, next) => {
    const password = req.body.password || req.body.newPassword;
    const result = passwordStrength(password);
    console.log(result);
    if (result.value !== 'Strong') {
        throw new BadRequestError(
            'This is a Weak Password, Try another password.'
        );
    }
    next();
};

// console.log(passwordStrength('asdfasdf').value)
// // Too weak (It will return Too weak if the value doesn't match the RegEx conditions)

// console.log(passwordStrength('asdf1234').value)
// // Weak

// console.log(passwordStrength('Asd1234!').value)
// // Medium

// console.log(passwordStrength('A@2asdF2020!!*').value)
// // Strong
