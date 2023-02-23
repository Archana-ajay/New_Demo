const jwt = require("../utils/jwt");
const bcrypt = require("../utils/bcrypt");
const db = require("../models");
const User = db.user;
const Invite = db.invite;
const Details = db.user_Details;
const { StatusCodes } = require("http-status-codes");
const UnauthorizedError = require("../errors/Unauthorized");
const UnauthenticatedError = require("../errors/unauthenticated");
const BadRequestError = require("../errors/bad-request");
const { decode } = require("jsonwebtoken");
const bucket = require("../utils/S3helper");
const ExifTransformer = require('exif-be-gone')
const exifremove = require('exifremove');
const fs=require('fs');
const CustomAPIError = require("../errors/custom-api");
//const { Op } = require("sequelize");
const moment = require("moment");
const Password = db.user_password;
const TooManyRequestException = require("../errors/max-request");
const client = require("../utils/redis");
const maxNumberOfFailedLogins = 5;
const timeWindowForFailedLogins = 60 * 60 * 1;

//user registration
const Register = async (req, res) => {
    const token = req.params.token;
    //verify token
    await jwt.verifyToken(token);
    //decod token
    // eslint-disable-next-line no-var
    var decoded = decode(token);
    //const { email } =decoded.email;

    const inviteUser = await Invite.findOne({
        where: { email: decoded.email },
    });

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
    //image upload
    if (req.files) {
        const userImage = req.files.image;
        console.log(userImage);
        const key = decoded.email.substring(0, decoded.email.lastIndexOf("@"));
        if (!userImage.mimetype.endsWith("jpeg")) {
            throw new BadRequestError("Please Upload jpeg Image");
        }
        const maxSize = 1024 * 1024;
        if (userImage.size > maxSize) {
            throw new BadRequestError("Please upload image smaller 1MB");
        }
        const reader = fs.createReadStream(userImage)
       // const writer = fs.createWriteStream('output.jpg')

    //     const startPortion = userImage.data[0].toString(16) + userImage.data[1].toString(16)+userImage.data[2].toString(16);
    //    console.log(userImage.data,startPortion);
    //    let image = await exifremove.remove(userImage.data);
        //console.log(userImage.data);
        console.log(image);
        // console.log(Buffer.from(userImage.data.slice(0, 4)));
        // const header = Buffer.from(userImage.data.slice(0, 4)).toString('hex');
        // console.log(header);
        if (startPortion !== 'ffd8ff'){
            throw new BadRequestError('Uploaded file is not a JPEG image.');
        }
        //await bucket.upload(userImage, key);
        req.body.image = key;
    }

    const userdata = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        email: req.body.email,
        phone: req.body.phone,
        image: req.body.image,
        passwordExpiry: moment().add(5, "days").format(),
    });
    await Password.create({
        password: req.body.password,
        createdBy: userdata.fullName,
        userId: userdata.id,
    });

    //updated registerdetails
    await Details.update(
        {
            registeredAt: userdata.createdAt,
            registerStatus: "completed",
            registerId: userdata.id,
        },
        { where: { email: decoded.email } }
    );
    await Invite.update(
        { status: "completed" },
        { where: { email: decoded.email } }
    );

    res.status(StatusCodes.OK).json({
        email: userdata.email,
        firstName: userdata.firstName,
        lastName: userdata.lastName,
        image: userdata.image,
        message: "registered successfully",
    });
};
//update user details
const update = async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) {
        throw new CustomAPIError("no user with this id");
    }
    if (req.files) {
        const userImage = req.files.image;
        const key = user.email.substring(0, user.email.lastIndexOf("@"));
        if (!userImage.mimetype.endsWith("png")) {
            throw new BadRequestError("Please Upload png Image");
        }
        const maxSize = 1024 * 1024;
        if (userImage.size > maxSize) {
            throw new BadRequestError("Please upload image smaller 1MB");
        }
        await bucket.upload(userImage, key);
        req.body.image = key;
    }
    //to update the user details
    await User.update(
        {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            image: req.body.image,
        },
        { where: { id: req.params.id } }
    );
    const userUpdate = await User.findByPk(req.params.id);
    res.status(StatusCodes.CREATED).json({
        message: "updated successfully",
        updated_user: {
            email: userUpdate.email,
            firstName: userUpdate.firstName,
            lastName: userUpdate.lastName,
            image: userUpdate.image,
        },
    });
};
//user login
const login = async (req, res) => {
    const { email, password } = req.body;
    //check user is not attempted too many login requests
    let attempts = await client.get(email);
    console.log(attempts);
    if (attempts > maxNumberOfFailedLogins) {
        throw new TooManyRequestException(
            "Too Many Attempts try it one hour later"
        );
    }

    if (!email || !password) {
        throw new BadRequestError("Please provide email and password");
    }
    const user = await User.findOne({ where: { email: email } });
    const invite = await Invite.findOne({ where: { email: email } });

    if (!user) {
        client.set(email, ++attempts, "ex", timeWindowForFailedLogins);
        throw new BadRequestError("Invalid Credentials");
    }
    //checking user action
    if (invite.action === false) {
        client.set(email, ++attempts, "ex", timeWindowForFailedLogins);
        throw new UnauthorizedError(
            "cannot access,user is restricted to log in "
        );
    }
    //checking if password expired
    if (
        moment(user.passwordExpiry).format("YYYY-MM-DD") ===
        moment().format("YYYY-MM-DD")
    ) {
        client.set(email, ++attempts, "ex", timeWindowForFailedLogins);
        throw new BadRequestError("password expired");
    }
    const user_passwords = await Password.findAll({
        where: { userId: user.id },
        order: [["createdAt", "DESC"]],
    });
    //password verify
    const passwords = user_passwords.map((pass) => pass.password);

    const passwordMatch = await bcrypt.verifyPassword(password, passwords[0]);
    if (!passwordMatch) {
        client.set(email, ++attempts, "ex", timeWindowForFailedLogins);
        throw new BadRequestError("password not match");
    }
    //succesfull login
    await client.del(email);
    const accessToken = jwt.generateAccessToken(req.body.email,user.id);
    //reset url
    const resetlink = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/user/resetpassword/${accessToken}`;
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
//password change
const resetPassword = async (req, res) => {
    const token = req.params.token;
    //verify token
    await jwt.verifyToken(token);

    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
        throw new UnauthenticatedError("User not found");
    }

    const user_passwords = await Password.findAll({
        where: { userId: user.id },
        order: [["createdAt", "DESC"]],
    });

    const passwords = user_passwords.map((pass) => pass.password);

    const passwordMatch = await bcrypt.verifyPassword(password, passwords[0]);
    if (!passwordMatch) {
        throw new BadRequestError("password not match");
    }
    const newPassword = await bcrypt.hashPassword(req.body.newPassword);
    const passwordMatchone = await bcrypt.verifyPassword(
        req.body.newPassword,
        passwords[0]
    );
    const passwordMatchtwo = await bcrypt.verifyPassword(
        req.body.newPassword,
        passwords[1]
    );
    const passwordMatchthree = await bcrypt.verifyPassword(
        req.body.newPassword,
        passwords[2]
    );

    if (!passwordMatchone && !passwordMatchtwo && !passwordMatchthree) {
        await Password.create({
            password: newPassword,
            createdBy: user.fullName,
            userId: user.id,
        });
        await User.update(
            { passwordExpiry: moment().add(5, "days").format() },
            { where: { email: user.email } }
        );
    } else {
        throw new BadRequestError("new password cannot be previous password");
    }

    res.status(StatusCodes.CREATED).json({
        message: "password reset successful",
    });
};

module.exports = { Register, update, login, resetPassword };