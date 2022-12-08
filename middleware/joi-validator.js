const CustomAPIError = require("../errors/custom-api");
const joi = require("joi");
const { string, not, any } = require("joi");

const userReg = (req, res, next) => {
    //create schema object
    const schema = joi.object({
        firstName: joi.string().required().min(2).max(25),
        lastName:joi.string().required().min(2).max(25),
        email: joi.string().required(),
        password: joi.string().required().min(4).max(25),
        phone: joi.number(),
        address: joi.object({
            city:joi.string().required(),
            state:joi.string().required(),
            country:joi.string().required()
        })
    });
    //schema options
    const options = {
        abortEarly: false, //include all errors
    };
    //validate request body
    const { error, value } = schema.validate(req.body, options);
    if (error) {
        throw new CustomAPIError(`validation error:${error.message}`);
    } else {
        req.body = value;
        next();
    }
};
const inviteSchema= (req, res, next) => {
    //create schema object
    const schema = joi.object({
        name:joi.string().required().min(2).max(30),
        email:joi.string().required().email(),
        
    });
    //schema options
    const options = {
        abortEarly: false, //include all errors
    };
    //validate request body
    const { error, value } = schema.validate(req.body, options);
    if (error) {
        throw new CustomAPIError(`validation error:${error.message}`);
    } else {
        req.body = value;
        next();
    }
};
const paramsSchema = (req, res, next) => {
    //create schema object
    const schema = joi.object({
        id:joi.number().required().min(1).max(100),
    });
    //schema options
    const options = {
        abortEarly: false, //include all errors
    };
    //validate request body
    const { error, value } = schema.validate(req.params, options);
    if (error) {
        throw new CustomAPIError(`validation error:${error.message}`);
    } else {
        req.body = value;
        next();
    }
};
const queryschema = (req, res, next) => {
    //create schema object
    const schema = joi.object({
        page:joi.number().min(0).max(100).default(0),
        size:joi.number().min(1).max(100).default(1),
        search:joi.string(),
        sort:joi.string().allow(",").valid("email","firstName","lastName").regex(/^[valid]{1-3}/)
    });
    //schema options
    const options = {
        abortEarly: false, //include all errors
    };
    //validate request body
    const { error, value } = schema.validate(req.query, options);
    if (error) {
        throw new CustomAPIError(`validation error:${error.message}`);
    } else {
        req.body = value;
        next();
    }
};
module.exports = {inviteSchema,userReg,paramsSchema,queryschema};