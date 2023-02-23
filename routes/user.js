const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const {
    Register,
    update,
    login,
    resetPassword,
} = require("../controller/user");
const { passwordStrengthCheck } = require("../middleware/passwordStrength");
const validationMiddleware = require("../middleware/joi-validator");
const limiter = rateLimit({
    max: 25,
    windowMs: 5 * 60 * 1000,
});
router.use(limiter);
router.post(
    "/register/:token",
    validationMiddleware.userReg,
    passwordStrengthCheck,
    Register
);
router.patch("/update/:id", validationMiddleware.updateSchema, update);
router.post("/login", validationMiddleware.loginSchema, login);
router.post(
    "/resetpassword/:token",
    validationMiddleware.resetSchema,
    resetPassword
);

module.exports = router;