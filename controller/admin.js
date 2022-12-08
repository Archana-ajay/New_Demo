const jwt = require("../utils/jwt");
const db = require("../models");
const User = db.user;
const Invite = db.invite;
const { StatusCodes } = require("http-status-codes");
const transporter = require("../utils/sendmail");
const CustomAPIError = require("../errors/custom-api");
const paginate=require("../utils/pagination")
const {Op}=require("sequelize")  
const {sorted} =require('../utils/sort');
const { object } = require("joi");
const bucket=require("../utils/S3helper");
const { url } = require("./user");

//sending invite mail
const sendInvite = async (req, res) => {
    await Invite.create(req.body);
    const accessToken = jwt.generateAccessToken(req.body.email);
    const registerURL = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/user/register/${accessToken}`;
    console.log(registerURL);
    var options={
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
    res.status(StatusCodes.OK).json({
      message:`Invite sent successfully to user ${req.body.email}`}
    );
};
//sendmail cancelling
const cancelUser = async (req, res) => {
    const invite = await Invite.findByPk(req.params.id);
    if(!invite)
    {
      throw new CustomAPIError("no user with this id");
    }
    await User.destroy({where:{email:invite.email}});
    await Invite.destroy({where:{email:invite.email}});
    res.status(StatusCodes.OK).json({message:"cancelled the mail of the following user",name:invite.name,email:invite.email});
};
//resend invite mail
const resendInvite = async (req, res) => {
      const invite = await Invite.findByPk(req.params.id);
      if(!invite)
      {
        throw new CustomAPIError("no user with this id");
      }
     //revoking the details of registred user
     await User.destroy({where:{email:invite.email}});
     await Invite.update({status:"waiting"},
     {where:{email:invite.email}});
     const accessToken = jwt.generateAccessToken(invite.email);
     const registerURL = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/user/register/${accessToken}`;
     let options={
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
     res.status(StatusCodes.OK).json({message:"Resend the invite successfully to user"}
    );
};

const getAllUsers=async (req,res)=>{
  const { page, size, search, sortKey, sortOrder } = req.query;
    //searching 
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
    var user=await User.findAndCountAll({
      attributes: [ "firstName", "lastName", "email", "id","phone","image","url"],
        where: condition,
        limit,
        offset,
       // order: [ [sortKey, sortOrder]],
    })
    const a=await user.rows[0].url
    console.log(a);
  //    async function url(user){
  //     const {firstName,image,lastName}=user
  //     return  {
  //       firstName:  firstName,
  //       lastName:  lastName,
  //       image:image,
  //       url: await buc
      
  //   }
  // }
  // for(i=0;i<user.rows.length;i++){
  //   const a={
  //     firstName:user.rows[i].firstName,
  //     lastName:user.rows[i].lastName,
  //     url:await user.rows[i].url
  //   }
  //   console.log(a);
  //   i=i+1
  // }


     // res.status(StatusCodes.OK).json(user.rows)
    //   console.log(a);
    //console.log("1",user.rows[0].url,"2",user.rows[1].url,"3");
    // var a=image:"jjj"[{},{},{}]              map(h=>({...h,imageUrl: user.phone}))
   // const d=user.rows.map(({firstName:user.phone,imageUrl: user.phone}))
    //console.log(d);
   // console.log(user.rows);
  // res.status(StatusCodes.OK).json({count:user.count,rows:[{finduser}]})
  // const response = await paginate.getPagingData(user, page, limit);
   


  //  const asyncRes = await Promise.all(arr.map(async (i) => {
  //   await sleep(10);
  //   return i + 1;
  // }));
  //  const a=await Promise.all(user.rows.map( async(a)=>{
  //   const url=  await `${a.url}`
  //   console.log(url);
  //   return {
  //     firstName:a.firstName,
  //     lastName:a.lastName,
  //     url: url
  //   }
  //  }))
  //  const results = await Promise.all(a)

  //   //res.status(StatusCodes.OK).json(user.rows.map(a=>({...a.dataValues,url:a.dataValues.image? await bucket.getSignedURL(a.dataValues.image):null})))
  //res.status(StatusCodes.OK).json(response.users.map( a=>({...a.dataValues,url: a.dataValues.url})))
  //
  res.status(StatusCodes.OK).json(user)
  
    
    
};

module.exports = { sendInvite, resendInvite, cancelUser,getAllUsers };







