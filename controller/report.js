const cron = require('node-cron');
const date = require('date-fns');
const db = require("../models");
const User = db.user;
const Invite = db.invite;
const transporter = require('../utils/sendmail');
const {Op}=require("sequelize")

//get date 
// const startOfDay = date.startOfDay(new Date());
// const endOfDay = date.endOfDay(new Date());
// console.log(startOfDay);
// console.log(endOfDay);

const startOfDay = new Date();
startOfDay.setUTCHours(0, 0, 0, 0);
console.log(startOfDay);

const endOfDay = new Date();
endOfDay.setUTCHours(23, 59, 59, 999); 
console.log(endOfDay);


//send email
exports.autoReport =  async() => {
    //counts
   
    const inviteCount =  await Invite.count({ where: {'createdAt': {[Op.gte]: startOfDay,[Op.lte]:endOfDay}} })
    const userCount = await User.count({ where: {'createdAt': {[Op.gte]: startOfDay,[Op.lte]:endOfDay}} })
    //Invite.count({ where: {'status':"completed",'createdAt': {[Op.gte]: startOfDay,[Op.lte]:endOfDay}} })
    const regUserCount =await Invite.count({ where: {'status':"completed",'createdAt': {[Op.gte]: startOfDay,[Op.lte]:endOfDay}} })
    const awaitingUserCount = await Invite.count({ where: {'status':"waiting",'createdAt': {[Op.gte]: startOfDay,[Op.lte]:endOfDay}} })
    const activeUserCount = await Invite.count({where:{'action' : true,'createdAt': {[Op.gte]: startOfDay,[Op.lte]:endOfDay}} })
    console.log(inviteCount,userCount,regUserCount,awaitingUserCount,activeUserCount);

    const message = `<p>This is an auto-generated email.</p>
                <p>StandardC User Registration Report \n\nDated On:${new Date()}</p>
                <p>number of mail sent today : ${inviteCount}</p>
                <p> : ${userCount} </p>
                <p>Registered Users : ${ regUserCount } </p>
                <p>Awaiting Users : ${ awaitingUserCount }</p>
                <p>Active Users : ${ activeUserCount }</p>`

    //scheduled on 23.55 everyday
    cron.schedule('55 23 * * *',async() => {
        await transporter.sendMail({
            from :'sample@gmail.com' ,
            to : 'ADMIN <admin@gmail.com>',
            subject : 'StandardC User Details',
            html : message,
        }); 
    });  
};