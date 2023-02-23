const CustomAPIError = require("../errors/custom-api");
const badRequestError = require("../errors/bad-request");
const joi = require("joi");

const userReg = (req, res, next) => {
    //create schema object
    const schema = joi.object({
        firstName: joi
            .string()
            .regex(/^[A-Z]+$/)
            .uppercase()
            .required(),
        lastName: joi
            .string()
            .regex(/^[A-Z]+$/)
            .uppercase()
            .required(),
        email: joi.string().required().email(),
        password: joi.string().required().min(4).max(25),
        phone: joi
            .string()
            .length(10)
            .regex(/^[0-9]{10}$/)
            .required(),
        image: joi.string(),
        address: joi.object({
            city: joi.string().required(),
            state: joi.string().required(),
            country: joi.string().required(),
        }),
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
const inviteSchema = (req, res, next) => {
    //create schema object
    const schema = joi.object({
        name: joi.string().required().min(2).max(30),
        email: joi.string().required().email(),
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
        id: joi.number().required().min(1).max(100),
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
const querySchema = (req, res, next) => {
    //create schema object
    const schema = joi.object({
        page: joi.number().min(0).max(100).default(0),
        size: joi.number().min(1).max(750).default(2),
        search: joi.string(),
        sortKey: joi.string().valid("firstName", "email", "lastName", "phone"),
        sortOrder: joi.string().valid("ASC", "DESC"),
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
const updateSchema = (req, res, next) => {
    //create schema object
    const schema = joi.object({
        firstName: joi
            .string()
            .regex(/^[A-Z]+$/)
            .uppercase()
            .optional(),
        lastName: joi
            .string()
            .regex(/^[A-Z]+$/)
            .uppercase()
            .optional(),
        phone: joi
            .string()
            .length(10)
            .regex(/^[0-9]{10}$/)
            .optional(),
        image: joi.string(),
        address: joi.object({
            city: joi.string().required(),
            state: joi.string().required(),
            country: joi.string().required(),
        }),
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
const loginSchema = (req, res, next) => {
    //create schema object
    const schema = joi.object({
        email: joi.string().required().email(),
        password: joi.string().required().min(4).max(25),
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
//
const resetSchema = (req, res, next) => {
    //create schema object
    const schema = joi.object({
        email: joi.string().required().email(),
        password: joi.string().required().min(4).max(25).alphanum(),
        newPassword: joi.string().required().min(4).max(25).alphanum(),
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

const cannabisBusiness = (req, res, next) => {
    //create schema object
    const schema = joi.object({
        is_cannabis_business: joi.string().valid("Y", "N").required(),
        basic_details: {
            name: joi.string().min(3).max(30).trim().required(),
            dba: joi.string().min(3).max(30).trim().required(),
            fedtaxid: joi.number().required(),
            state_of_incorporation: joi.string().uuid().required(),
        },
        cannabis_related_details: joi.when("is_cannabis_business", {
            is: "Y",
            then: joi.object({
                cannabis_business_type: joi.string().uuid().required(),
                cannabis_license_category: joi.string().uuid().required(),
                license_number: joi.string().min(3).max(50).required(),
                cannabis_licensed_country: joi.string().uuid().required(),
                cannabis_licensed_state: joi.string().uuid().required(),
            }),
            otherwise: joi.forbidden(),
        }),
        contact_details: {
            legal_address: {
                zipcode: joi.string().trim().min(4).required(),
                street_no: joi.string().max(5).required(),
                street_name: joi
                    .string()
                    .trim()
                    .min(3)
                    .max(50)
                    .trim()
                    .required(),
                phone_number: joi.string().trim().max(12).trim().required(),
                phone_type: joi.string().uuid().required(),
            },
            business_location: {
                is_business_location_sameas_legal_address: joi
                    .string()
                    .valid("Y", "N")
                    .required(),
                zipcode: joi.when("is_business_location_sameas_legal_address", {
                    is: "N",
                    then: joi.string().trim().max(8).required(),
                    otherwise: joi.forbidden(),
                }),
                street_no: joi.when(
                    "is_business_location_sameas_legal_address",
                    {
                        is: "N",
                        then: joi.string().max(5).required(),
                        otherwise: joi.forbidden(),
                    }
                ),
                street_name: joi.when(
                    "is_business_location_sameas_legal_address",
                    {
                        is: "N",
                        then: joi
                            .string()
                            .trim()
                            .min(3)
                            .max(50)
                            .trim()
                            .required(),
                        otherwise: joi.forbidden(),
                    }
                ),
            },
        },
        key_person_registration: {
            add_user: joi.string().valid("Y", "N").required(),
            user: joi.when("add_user", {
                is: "Y",
                then: joi.array().items(
                    joi.object({
                        user_type: joi.string().uuid().required(),
                        name: joi
                            .string()
                            .trim()
                            .min(3)
                            .max(50)
                            .trim()
                            .required(),
                        email: joi.string().trim().email().required(),
                        ownership_percentage: joi.when("user_type", {
                            is: "7cf77242-181c-45a2-94a5-2728974e8805",
                            then: joi.number().min(20).max(100).required(),
                            otherwise: joi.forbidden(),
                        }),
                        investor_type: joi.when("user_type", {
                            is: "f63eda23-26fc-4594-b398-813c82f3e33b",
                            then: joi.string().uuid().required(),
                            otherwise: joi.forbidden(),
                        }),
                        access_type: joi
                            .string()
                            .valid("Admin", "Advanced", "Limited", "No access")
                            .required(),
                        set_as_contact_person: joi
                            .string()
                            .valid("Y", "N")
                            .required(),
                    })
                ),
                otherwise: joi.forbidden(),
            }),
        },
    });
    //schema options
    const options = {
        abortEarly: false, //include all errors
    };
    //validate request body
    const { error, value } = schema.validate(req.body, options);
    if (error) {
        throw new badRequestError(`validation error:${error.message}`);
    } else {
        req.body = value;
        next();
    }
};

const querySchemaBusinessList = (req, res, next) => {
    //create schema object
    const schema = joi.object({
        page: joi.number().min(0).max(100).default(0),
        size: joi.number().min(1).max(750).default(2),
        search: joi.string(),
        filterby: joi
            .string()
            .valid("cannabis", "non-cannabis", "approved vendor"),
        sortKey: joi.string().valid("business_id", "dba", "name"),
        sortOrder: joi.string().valid("ASC", "DESC"),
    });
    //schema options
    const options = {
        abortEarly: false, //include all errors
    };
    //validate request body
    const { error, value } = schema.validate(req.query, options);
    if (error) {
        throw new badRequestError(`validation error:${error.message}`);
    } else {
        req.body = value;
        next();
    }
};
const getOneParamsSchema = (req, res, next) => {
    //create schema object
    const schema = joi.object({
        id: joi.string().uuid().required().max(100),
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

const updateBusiness = (req, res, next) => {
    //create schema object
    const schema = joi.object({
        basic_details: {
            name: joi.string().min(3).max(30).trim(),
            dba: joi.string().min(3).max(30).trim(),
            fedtaxid: joi.number(),
            state_of_incorporation: joi.string().uuid(),
        },
        cannabis_related_details: {
            cannabis_business_type: joi.string().uuid(),
            cannabis_license_category: joi.string().uuid(),
            license_number: joi.string().min(3).max(50),
            cannabis_licensed_country: joi.string().uuid(),
            cannabis_licensed_state: joi.string().uuid(),
        },
        contact_details: {
            legal_address: {
                zipcode: joi.string().trim().min(4),
                street_no: joi.string().max(8),
                street_name: joi.string().min(5).max(15).trim(),
                phone_number: joi.string().trim().max(12).trim(),
                phone_type: joi.string().uuid(),
            },
            business_location: {
                is_business_location_sameas_legal_address: joi
                    .string()
                    .valid("Y", "N")
                    .required(),
                zipcode: joi.when("is_business_location_sameas_legal_address", {
                    is: "N",
                    then: joi.string().trim().max(8),
                    otherwise: joi.forbidden(),
                }),
                street_no: joi.when(
                    "is_business_location_sameas_legal_address",
                    {
                        is: "N",
                        then: joi.string().max(5),
                        otherwise: joi.forbidden(),
                    }
                ),
                street_name: joi.when(
                    "is_business_location_sameas_legal_address",
                    {
                        is: "N",
                        then: joi.string().trim().min(3).max(50).trim(),
                        otherwise: joi.forbidden(),
                    }
                ),
            },
        },
        key_person_registration: {
            add_user: joi.string().valid("Y", "N").required(),
            user: joi.when("add_user", {
                is: "Y",
                then: joi.array().items(
                    joi.object({
                        user_type: joi.string().uuid().required(),
                        name: joi
                            .string()
                            .trim()
                            .min(3)
                            .max(50)
                            .trim()
                            .required(),
                        email: joi.string().trim().email().required(),
                        ownership_percentage: joi.when("user_type", {
                            is: "7cf77242-181c-45a2-94a5-2728974e8805",
                            then: joi.number().min(20).max(100).required(),
                            otherwise: joi.forbidden(),
                        }),
                        investor_type: joi.when("user_type", {
                            is: "f63eda23-26fc-4594-b398-813c82f3e33b",
                            then: joi.string().uuid().required(),
                            otherwise: joi.forbidden(),
                        }),
                        access_type: joi
                            .string()
                            .valid("Admin", "Advanced", "Limited", "No access")
                            .required(),
                        set_as_contact_person: joi
                            .string()
                            .valid("Y", "N")
                            .required(),
                    })
                ),
                otherwise: joi.forbidden(),
            }),
            edit_users: joi.array().items(
                joi.object({
                    id: joi.string().uuid().required(),
                    delete_user: joi.string().valid("Y", "N"),
                    user_type: joi.string().uuid(),
                    name: joi.string().trim().min(3).max(50).trim(),
                    email: joi.string().trim().email(),
                    ownership_percentage: joi.when("user_type", {
                        is: "7cf77242-181c-45a2-94a5-2728974e8805",
                        then: joi.number().min(20).max(100),
                        otherwise: joi.forbidden(),
                    }),
                    investor_type: joi.when("user_type", {
                        is: "f63eda23-26fc-4594-b398-813c82f3e33b",
                        then: joi.string().uuid(),
                        otherwise: joi.forbidden(),
                    }),
                    access_type: joi
                        .string()
                        .valid("Admin", "Advanced", "Limited", "No access"),
                    set_as_contact_person: joi.string().valid("Y", "N"),
                })
            ),
        },
    });
    //schema options
    const options = {
        abortEarly: false, //include all errors
    };
    //validate request body
    const { error, value } = schema.validate(req.body, options);
    if (error) {
        throw new badRequestError(`validation error:${error.message}`);
    } else {
        req.body = value;
        next();
    }
};

module.exports = {
    userReg,
    inviteSchema,
    paramsSchema,
    querySchema,
    updateSchema,
    loginSchema,
    resetSchema,
    cannabisBusiness,
    querySchemaBusinessList,
    getOneParamsSchema,
    updateBusiness,
};