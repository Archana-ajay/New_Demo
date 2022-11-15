const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host:'smtp.mailtrap.io',
  port:25,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  },
});
module.exports=transporter