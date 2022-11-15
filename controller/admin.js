const jwt = require("../utils/jwt");
const db = require("../models");
const User = db.user;
const Invite = db.invite;
const { StatusCodes } = require("http-status-codes");
const transporter = require("../utils/sendmail");
const CustomAPIError = require("../errors/custom-api");
const paginate=require("../utils/pagination")
const {Op}=require("sequelize")  
const {sorted} =require('../utils/sort')

//sending invite mail
const sendInvite = async (req, res) => {
    await Invite.create(req.body);
    const accessToken = jwt.generateAccessToken(req.body.email);
    const registerURL = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/user/register/${accessToken}`;
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
    await transporter.sendMail(options);
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
  const { page, size,search,sort } = req.query;
  console.log(sorted(sort));
  
  // const sortList = sort.split(',')
  // console.log(lastName)
  // console.log(`${lastName}`);
  var condition = search ? { [Op.or]:[{firstName: { [Op.like]: `%${search}%`}},{email:{ [Op.like]: `%${search}%`} },{lastName: { [Op.like]: `%${search}%`}}]}: null;
  //var order=sort?[sort,"ASC"]:["email",'ASC']
    const { limit, offset } = paginate.getPagination(page, size);
    User.findAndCountAll({
      where: condition,
        limit,
        offset,
        order:sorted(sort)
    }).then((data) => {
        const response = paginate.getPagingData(data, page, limit);
        res.status(StatusCodes.OK).json(response);
    });
}

module.exports = { sendInvite, resendInvite, cancelUser,getAllUsers };







