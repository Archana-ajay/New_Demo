const jwt = require("../utils/jwt");
const db = require("../models");
const User = db.user;
const Invite = db.invite;
const Details = db.user_Details;
const { StatusCodes } = require("http-status-codes");
const transporter = require("../utils/sendmail");
const CustomAPIError = require("../errors/custom-api");
const paginate = require("../utils/pagination");
const { Op } = require("sequelize");
const bucket = require("../utils/S3helper");
const speakeasy=require('speakeasy');
const fs = require('fs');
const path = require('path');

const { toDataURL } = require('qrcode');
const BadRequestError = require("../errors/bad-request");
const Authentication=db.twofactorAuthentication;
//sending invite mail
const sendInvite = async (req, res) => {
    const userName = req.user.username;
    const accessToken = jwt.generateAccessToken(req.body.email);
    const registerURL = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/user/register/${accessToken}`;
    // eslint-disable-next-line no-var
    console.log(registerURL);
    var options = {
        from: '"ADMIN" <admin@gmail.com>',
        to: req.body.email,
        subject: "Welcome to StandardC",
        html: `<p>Hi, ${req.body.name}! </p>
            <p>You or someone on your behalf requested to sign-up with StandardC. By pressing the link , you opt-in to sign-up with StandardC.</p>
            <br>verify your email with StandardC.
            <p> <a href=${registerURL}> Register Now </a></p>
            <br>This link will expire after 1 day`,
    };
    //await transporter.sendMail(options);
    const invite = await Invite.create({
        name: req.body.name,
        email: req.body.email,
    });

    //update emailinvite details
    await Details.create({
        email: invite.email,
        emailInviteStatus: "sent",
        inviteSentAt: invite.createdAt,
        invitedBy: userName,
    });
    res.status(StatusCodes.OK).json({
        message: `Invite sent successfully to user ${req.body.email}`,
    });
};
//sendmail cancelling
const cancelUser = async (req, res) => {
    const invite = await Invite.findByPk(req.params.id);
    if (!invite) {
        throw new CustomAPIError("no user with this id");
    }
    await User.destroy({ where: { email: invite.email } });
    await Invite.destroy({ where: { email: invite.email } });
    res.status(StatusCodes.OK).json({
        message: "cancelled the mail of the following user",
        name: invite.name,
        email: invite.email,
    });
};
//resend invite mail
const resendInvite = async (req, res) => {
    const invite = await Invite.findByPk(req.params.id);
    if (!invite) {
        throw new CustomAPIError("no user with this id");
    }
    //revoking the details of registred user
    await User.destroy({ where: { email: invite.email } });
    await Invite.update(
        { status: "waiting" },
        { where: { email: invite.email } }
    );
    const accessToken = jwt.generateAccessToken(invite.email);
    const registerURL = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/user/register/${accessToken}`;
    // eslint-disable-next-line prefer-const
    let options = {
        from: '"ADMIN" <admin@gmail.com>',
        to: invite.email,
        subject: "Welcome to StandardC",
        html: `<p>Hi, ${req.body.name}! </p>
            <p>You or someone on your behalf requested to sign-up with StandardC. By pressing the link , you opt-in to sign-up with StandardC.</p>
            <br>verify your email with StandardC.
            <p> <a href=${registerURL}> Register Now </a></p>
            <br>This link will expire after 1 day`,
    };
    // eslint-disable-next-line no-undef
    await transporter.sendMail(options);
    res.status(StatusCodes.OK).json({
        message: "Resend the invite successfully to user",
    });
};
//get userlist

const getUserList = async (req, res) => {
    const { page, size, search, sortKey, sortOrder } = req.query;
    //searching
    // eslint-disable-next-line no-var
    var condition = search
        ? {
              [Op.or]: [
                  { firstName: { [Op.like]: `%${search}%` } },
                  { email: { [Op.like]: `%${search}%` } },
                  { lastName: { [Op.like]: `%${search}%` } },
              ],
          }
        : null;
    const { limit, offset } = paginate.getPagination(page, size);
    const user = await User.findAndCountAll({
        where: condition,
        limit,
        offset,
        order: [[sortKey || "createdBy", sortOrder || "ASC"]],
        attributes: [
            "firstName",
            "lastName",
            "email",
            "id",
            "image",
            "imageUrl",
        ],
    });
    console.log(user.rows[0].imageURl);
    const response = paginate.getPagingData(user, page, limit);
    res.status(StatusCodes.OK).json(response);
};
//user details
const getUser = async (req, res) => {
    const user = await User.findOne({
        where: { id: req.params.id },
        attributes: ["id", "firstName", "lastName", "email", "phone", "image"],
    });
    if (!user) {
        throw new CustomAPIError("no user with this id");
    }
    if (user.image) {
        // eslint-disable-next-line no-var
        var image = await bucket.getSignedURL(user.image);
    }
    res.status(StatusCodes.OK).json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        imageURl: image,
    });
};

//userhistory
const userHistory = async (req, res) => {
    const user = await Details.findByPk(req.params.id);
    if (!user) {
        throw new CustomAPIError("no user with this id");
    }
    const userDetails = await Details.findOne({
        where: { id: req.params.id },
        attributes: [
            "email",
            "emailInviteStatus",
            "inviteSentAt",
            "registerStatus",
            "registeredAt",
            "invitedBy",
        ],
    });
    res.status(StatusCodes.OK).json({
        inviteDetails: {
            Date: userDetails.inviteSentAt,
            Time: userDetails.inviteSentAt,
            inviteStatus: userDetails.emailInviteStatus,
            updatedBy: userDetails.invitedBy,
        },
        registerDetails: {
            Date: userDetails.registeredAt,
            Time: userDetails.registeredAt,
            registerStatus: userDetails.registerStatus,
            updatedBy: userDetails.invitedBy,
        },
    });
};
//restriction
const restrict = async (req, res) => {
    const invite = await Invite.findByPk(req.params.id);
    if (!invite) {
        throw new CustomAPIError("no user with this id");
    }
    await Invite.update({ action: false }, { where: { email: invite.email } });
    res.status(StatusCodes.OK).json({ message: "restricted successfully" });
};
const GenerateOTP = async (req, res) => {
    const user = await  User.findByPk(req.params.id);
    if (!user) {
        throw new CustomAPIError("no user with this id");
    }
    const { ascii, hex, base32, otpauth_url } = speakeasy.generateSecret({
        issuer: "admin",
        name: "new admin",
        length: 15,
      });
      console.log(hex);
      await Authentication.create({
        user_id:user.id,
        otp_ascii: ascii,
        otp_auth_url: otpauth_url,
        otp_base32: base32,
        otp_hex: hex,
      })
 
// // Print the QR code to terminal
// QRCode.toString(stringdata,{type:'terminal'},
//                     function (err, QRcode) {
 
//     if(err) return console.log("error occurred")
 
//     // Printing the generated code
//     console.log(QRcode)
// })
   
// Converting the data into base64
// await toDataURL(stringdata, function (err, code) {
//     if(err) return console.log("error occurred")
 
//     // Printing the code
//     console.log(code)
// })
      const qrcode = await toDataURL(otpauth_url);
      console.log(qrcode);
      //const base64Image = qrcode.split(';base64,').pop();
      //console.log(base64Image);
        //res.send(`<img src="data:image/png;base64,${base64Image}" />`);
    //   const base64Image = qrcode.split(';base64,').pop();
       res.send(`<img src="${qrcode}" />`);
    //   res.status(StatusCodes.OK).json({
    //     base32,
    //     otpauth_url,
    //   });
}
const VerifyOTP = async (req, res) => {
    const authentication = await  Authentication.findOne({where: { user_id: req.params.id }});
    if (!authentication) {
        throw new CustomAPIError("Token is invalid or user doesn't exist");
    }
    console.log(authentication);
    const verified = speakeasy.totp.verify({
        secret: authentication.otp_base32,
        encoding: "base32",
        token:req.body.token,
      });
    //   if (!verified) {
    //     throw new BadRequestError("Token is invalid or user doesn't exist")
    //   }
      const updatedUser = await Authentication.update(
        {
            otp_enabled: true,
            otp_verified: true,
          },
        {where: { user_id: req.params.id }} 
      );
      const secrets = [];
      for (let i = 0; i < 10; i++) {
        const secret = speakeasy.generateSecret({ length: 10, symbols: false }).base32;
        secrets.push(secret);
      }
      
      // Format the secrets as recovery codes with a hyphen delimiter
      const recoveryCodes = secrets.map(secret => {
        return secret.slice(0, 5) + '-' + secret.slice(5, 10);
      });
      await Authentication.update(
        {
            recovery_codes:recoveryCodes,
          },
        {where: { user_id: req.params.id }} 
      );
            
      // Set headers to force download of the file
      res.setHeader('Content-Disposition', 'attachment; filename=recovery-codes.txt');
      res.setHeader('Content-Type', 'text/plain');
      
      // Create a readable stream from the recovery codes array
      const readable = require('stream').Readable.from(recoveryCodes.join('\n'));
      res.write('Download your recovery codes:\n\n');

      
      // Pipe the readable stream to the response stream
      readable.pipe(res);
    //   const details=await Authentication.findOne({where: { user_id: req.params.id }});

    //   res.status(StatusCodes.OK).json({
    //     id: details.user_id,
    //     otp_verified: details.otp_verified,
    //     otp_enabled: details.otp_enabled,
    //   });
};
const ValidateOTP = async (req, res) => {
    const authentication = await  Authentication.findOne({where: { user_id: req.params.id }});
    if (!authentication) {
        throw new CustomAPIError("Token is invalid or user doesn't exist");
    }
    const validToken = speakeasy.totp.verify({
        secret: authentication?.otp_base32,
        encoding: "base32",
        token:req.body.token,
        window: 1,
      });
      if(!validToken){
        throw new BadRequestError("Token is invalid or user doesn't exist")
      }
      res.redirect('https://localhost:3000/api/v1/admin/otp/recoveryverify/2ee28b9f-7589-43e1-b672-f375878d3063');
      
    //   res.status(StatusCodes.OK).json({
    //     otp_valid: true,
    //   });
    
};
const recoverycode=async(req,res)=>{
    const authentication = await  Authentication.findOne({where: { user_id: req.params.id }});
    if (!authentication) {
        throw new CustomAPIError(" user doesn't exist");
    }
        const secrets = [];
for (let i = 0; i < 10; i++) {
  const secret = speakeasy.generateSecret({ length: 10, symbols: false }).base32;
  secrets.push(secret);
}

// Format the secrets as recovery codes with a hyphen delimiter
const recoveryCodes = secrets.map(secret => {
  return secret.slice(0, 5) + '-' + secret.slice(5, 10);
});
        //var codesFile = path.join(__dirname, '..', 'temp', `${authentication.user_id}-recovery-codes.txt`);
       // fs.writeFileSync(codesFile,  recoveryCodes.join('\n'));
      
// Set headers to force download of the file
res.setHeader('Content-Disposition', 'attachment; filename=recovery-codes.txt');
res.setHeader('Content-Type', 'text/plain');

// Create a readable stream from the recovery codes array
const readable = require('stream').Readable.from(recoveryCodes.join('\n'));

// Pipe the readable stream to the response stream
readable.pipe(res);
//   // Set headers to force download of the file
//   res.setHeader('Content-Disposition', 'attachment; filename=recovery-codes.txt');
//   res.setHeader('Content-Type', 'text/plain');

//   // Send the file as the response
//   const stream = fs.createReadStream(codesFile);
//   stream.pipe(res);

//   // Clean up the temporary file after sending it
//   stream.on('end', () => {
//     fs.unlinkSync(codesFile);
//   });
};
const recoveryverify=async(req,res)=>{
    const authentication = await  Authentication.findOne({where: { user_id: req.params.id }});
    if (!authentication) {
        throw new CustomAPIError(" user doesn't exist");
    }
    if(!authentication.recovery_codes.includes(req.body.code)){
        throw new BadRequestError("recover code isnot match")
    }
    
}

module.exports = {
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
    recoveryverify
};