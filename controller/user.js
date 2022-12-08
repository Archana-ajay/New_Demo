const jwt = require("../utils/jwt");
const bcrypt = require("../utils/bcrypt");
const db = require("../models");
const User = db.user;
const Invite = db.invite;
const Password=db.user_password
const path = require('path');
const rateLimit = require('express-rate-limit')
//const client = require('../utils/redis');
const Redis = require('ioredis')

//const hi=require("../utils/pagination")
const { StatusCodes } = require("http-status-codes");
const UnauthorizedError = require("../errors/Unauthorized");
const UnauthenticatedError = require("../errors/Unauthenticated");
const BadRequestError = require("../errors/bad-request");
const CustomAPIError=require("../errors/custom-api")
const TooManyRequestException=require("../errors/max-request")
const {decode} = require("jsonwebtoken");
const { Op } = require("sequelize");
const sequelize=require("sequelize");
const { array } = require("joi");
const bucket=require('../utils/S3helper')
const transporter = require("../utils/sendmail");
const moment = require('moment');
const redis = new Redis()
// Each IP can only send 5 login requests in 10 minutes
//const loginRateLimiter = new rateLimit({ max: 5, windowMS: 1000 * 60 * 10 })

const maxNumberOfFailedLogins = 3;
const timeWindowForFailedLogins = 60 * 60 * 1
//report.autoReport()

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
          const imagePath = path.join(__dirname, '../uploads/' + `${userImage.name}`);
          await userImage.mv(imagePath);
         // req.body.image = `/uploads/${bookImage.name}`;
          
          req.body.image=key
          exports.url="hhhh"
    }

    const userdata = await User.create({firstName:req.body.firstName,lastName:req.body.lastName,address:req.body.address,email:req.body.email,phone:req.body.phone,passwordExpiry:moment().add(5, 'days').format(),image:req.body.image});
    await Password.create({password:req.body.password,createdBy:userdata.fullName,userId:userdata.id})
    await Invite.update({status:"completed"},
    {where:{email:decoded.email}}
    );
    res.status(StatusCodes.OK).json({
        email: userdata.email,
        firstName: userdata.firstName,
        lastName: userdata.lastName,
        createdAt:userdata.createdAt.toLocaleDateString()||null,
        message: "registered successfully",
    });
};
const update = async(req,res)=>
{
    const user = await User.findByPk( req.params.id);
    if (!user) {
        throw new CustomAPIError("no user with this id");
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
    await User.update({firstName:req.body.firstName,lastName:req.body.lastName,phone:req.body.phone,image:req.body.image}, { where: { id: req.params.id} });
    const userUpdate=await User.findByPk(req.params.id)
    res.status(StatusCodes.CREATED).json({
        message: "updated successfully",
        updated_user: { email: userUpdate.email,
            firstName: userUpdate.firstName,
            lastName: userUpdate.lastName,
            image:userUpdate.image,
            },
    });
};
const login = async (req, res) => {
    const { email, password } = req.body;
    let userAttempts = await redis.get(email);
    console.log(userAttempts);
    if(userAttempts > maxNumberOfFailedLogins) throw new TooManyRequestException("Too Many Attempts try it one hour later");
    if (!email || !password) {
        throw new BadRequestError("Please provide email and password");
    }
    const user = await User.findOne({ where: { email: email } });
    const invite = await Invite.findOne({ where: { email: email } });

    if (!user) {
        await redis.set(email, ++userAttempts, 'ex', timeWindowForFailedLogins)
        throw new BadRequestError("Invalid Credentials");
    }
    //checking user action
    if (invite.action === false) {
        await redis.set(email, ++userAttempts, 'ex', timeWindowForFailedLogins)
        throw new UnauthorizedError(
            "cannot access,user is restricted to log in "
        );
    }
    //checking if password expired
    if(moment(user.passwordExpiry).format('YYYY-MM-DD')===moment().format('YYYY-MM-DD')){ 
        await redis.set(email, ++userAttempts, 'ex', timeWindowForFailedLogins)
        throw new BadRequestError("password expired");
    }
    await redis.del(email)
    const accessToken = jwt.generateAccessToken(req.body.email);
    //reset url
    const resetlink = `${req.protocol}://${req.get('host')}/api/v1/user/resetpassword/${accessToken}`;
    res.status(StatusCodes.OK).json({
        user: {
            name: user.name,
            userId: user.id,
            accessToken,
            resetlink,
            loginedAt: new Date(),
        },
    });
};

const resetPassword=async(req,res)=>{
    const email=req.body.email;
    const password=req.body.password
    const user=await User.findOne({where:{email:email}});
    if (!user) {
        throw new UnauthenticatedError("User not found");
    }
    const user_passwords=await Password.findAll({
        where : { userId : user.id},
        order: [['createdAt','DESC']],
       });
    const passwords=user_passwords.map(pass=>pass.password)
   // console.log(passwords[0].password);
    const passwordMatch = await bcrypt.verifyPassword(password, passwords[0]);
    if(!passwordMatch){
           throw new BadRequestError("password not match")
       }
    const newPassword=await bcrypt.hashPassword(req.body.newPassword)
    const passwordMatchone = await bcrypt.verifyPassword(req.body.newPassword, passwords[0]);
    const passwordMatchtwo = await bcrypt.verifyPassword(req.body.newPassword, passwords[1]);
    const passwordMatchthree=await bcrypt.verifyPassword(req.body.newPassword,passwords[2])

    if(!passwordMatchone&&!passwordMatchtwo&&!passwordMatchthree){
    await Password.create({password:newPassword,createdBy:user.fullName,userId:user.id})
    await User.update({passwordExpiry:moment().add(5, 'days').format()},
     {where:{email:user.email}});
    }
    else{
        throw new BadRequestError("new password cannot be previous password")
    }
    
    res.status(StatusCodes.CREATED).json({message:"password reset successful"})
}
module.exports = { Register,update,resetPassword,login };