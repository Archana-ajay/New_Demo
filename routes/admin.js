 const express = require("express");
const router = express.Router();
const validationMiddleware = require("../middleware/joi-validator");
const {
    sendInvite,
    resendInvite,
    cancelUser,
    getUserList,
    getUser,
    userHistory,
    restrict,
    GenerateOTP,
    VerifyOTP,
    ValidateOTP,
    recoverycode,
    recoveryverify,
} = require("../controller/admin");

router.post("/invite", validationMiddleware.inviteSchema, sendInvite);
router.get("/resend/:id", validationMiddleware.paramsSchema, resendInvite);
router.get("/cancel/:id", validationMiddleware.paramsSchema, cancelUser);
router.get("/userslist", validationMiddleware.querySchema, getUserList);
router.get("/userdata/:id", validationMiddleware.paramsSchema, getUser);
router.get("/userhistory/:id", validationMiddleware.paramsSchema, userHistory);
router.get("/restrict/:id", restrict);
router.get("/otp/generate/:id",GenerateOTP);
router.post("/otp/verify/:id",VerifyOTP);
router.post("/otp/validate/:id",ValidateOTP);
router.post("/otp/recovery/:id",recoverycode);
router.post("/otp/recoveryverify/:id",recoveryverify);
module.exports = router;