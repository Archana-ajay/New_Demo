const jwt = require("../utils/jwt");
const bcrypt = require("../utils/bcrypt");
const db = require("../models");
const User = db.user;
const Invite = db.invite;
const { StatusCodes } = require("http-status-codes");
const UnauthorizedError = require("../errors/Unauthorized");
const UnauthenticatedError = require("../errors/Unauthenticated");
const BadRequestError = require("../errors/bad-request");
const {decode} = require("jsonwebtoken");

//user registration
const Register = async (req, res) => {
    const token = req.params.token;
        //verify token
        await jwt.verifyToken(token);
        //decod token
        const decoded=decode(token);
       // const { email } =decoded.email;
        const inviteUser=await Invite.findOne({where:{email:decoded.email}});

    if (!inviteUser) {
        throw new UnauthenticatedError("User not found");
    }
    if (inviteUser.action !== true) {
        throw new UnauthorizedError("cannot access");
    }
    if (inviteUser.status === "completed") {
        throw new BadRequestError("User already registered");
    }
    req.body.password = await bcrypt.hashPassword(req.body.password);
    if(req.body.email!==decoded.email){
        throw new UnauthenticatedError("please provide valid email")
    }
    if(req.files) {
        const userImage = req.files.image;
        const key = email.substring(0, email. lastIndexOf('@'));
        if (!userImage.mimetype.endsWith("png")) {
            throw new BadRequestError("Please Upload png Image");
          }
          const maxSize = 1024 * 1024;
          if (userImage.size > maxSize) {
            throw new BadRequestError("Please upload image smaller 1MB");
          }
          await bucket.upload(userImage,key);
          req.body.image=key
        } 
    const userdata = await User.create({firstName:req.body.firstName,lastName:req.body.lastName,address:req.body.address,email:req.body.email,phone:req.body.phone,password:req.body.password});
    await Invite.update({status:"completed"},
    {where:{email:decoded.email}}
    );
    res.status(StatusCodes.OK).json({
        email: userdata.email,
        firstName: userdata.firstName,
        lastName: userdata.lastName,
        message: "registered successfully",
    });
};
module.exports = { Register };