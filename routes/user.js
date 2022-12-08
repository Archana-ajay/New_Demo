const express = require('express');
const fileUpload = require("express-fileupload");
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {Register,update,resetPassword,login} = require('../controller/user');
const { testPasswordStrength } = require('../utils/strong_password');
const validationMiddleware=require('../middleware/joi-validator')
const limiter = rateLimit({
    max: 5,
    windowMs: 5 * 60 * 1000,
    message: "Too many request from this IP"
});
router.use(limiter)
router.use("/register/:token", fileUpload({ useTempFiles: false }));
router.post("/register/:token",testPasswordStrength, Register);
router.use("/update/:id",fileUpload({ useTempFiles: false }))
router.patch("/update/:id",update);
router.post("/resetpassword", resetPassword);
router.post("/login", login);

module.exports = router;