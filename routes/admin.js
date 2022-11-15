const express = require('express');
const router = express.Router();
const {sendInvite,resendInvite,cancelUser,getAllUsers} = require('../controller/admin');
const validationMiddleware=require('../middleware/joi-validator')

router.post('/sendinvite',validationMiddleware.inviteSchema,sendInvite)
router.get('/resend/:id',validationMiddleware.paramsSchema,resendInvite)
router.get('/cancel/:id',validationMiddleware.paramsSchema,cancelUser)
router.get('/users',validationMiddleware.queryschema,getAllUsers)

module.exports = router;