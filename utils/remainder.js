const cron = require('node-cron');
const db = require("../models");
const User = db.user;
const transporter = require('./sendmail');
const moment = require('moment');
	

//send email
exports.reminder =  async() => {
    //var tomorrow = new Date()
    //tomorrow.setDate(tomorrow.getDate() + 1)
    const a =await User.findAll()
    const users=await User.findAll({where:{passwordExpiry:moment().add(1, 'days').format('YYYY-MM-DD')}})
    console.log(users);
    console.log();
               

    //scheduled on 23.55 everyday
    cron.schedule('03 18 * * *',async() => {
        await users.map( async(a)=>{
            if(moment(a.passwordExpiry).format('YYYY-MM-DD')===moment().add(1, 'days').format("YYYY-MM-DD"))
            {
            await transporter.sendMail({
                from :'sample@gmail.com' ,
                to : `${a.email}`,
                subject : 'StandardC password remainder',
                html : `<p>Hi, ${a.firstName+" "+a.lastName}!</p>
                <p>  This is a remainder mail from Standard C. </p>
                <p>Your password will be expired on  <b>Tommorow</b><i> ${a.passwordExpires}</i>.</p>
                <p>Login to StandardC and reset the password as soon as possible.</p>
                <p>Thank you.</p>`
            }) }})
        })
}; 