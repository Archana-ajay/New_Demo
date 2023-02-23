const { StatusCodes } = require("http-status-codes");
const db = require("../models");
//const address = require("../models/address");
const moment = require("moment");
const CustomAPIError = require("../errors/custom-api");
const ReadableStream = require('stream').Readable;
const Json2csvTransform = require('json2csv').Transform;
const User = db.user;
const User_preferences = db.user_prefrences;
const business_history = db.business_history;
//const client = require("../utills/redis");
const Business = db.Business;
const Country = db.Country;
const Zipcode = db.Zipcode;
const PhoneType = db.Phonetype;
const LicenseType = db.Licensetype;
const LicenseTypedesign = db.Licensetypedesign;
const Region = db.Region;
const Business_address = db.Business_address;
const InvestorType = db.Investortype;
const EntityType = db.Entitytype;
const Address = db.Address;
const UserAssociationType = db.Userassociation;
const User_Association = db.User_Association;
const License = db.License;
const Phones = db.Phones;
const BadRequestError = require("../errors/bad-request");
const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");
const Stage_Statuses = db.Stage_Statuses;
const paginate = require("../utils/pagination");
const UnauthorizedError = require("../errors/unauthorized");
// eslint-disable-next-line no-unused-vars
const address = require("../models/address");
const { csvDownload } = require("../utils/csv");
const pdfExport = require("../utils/pdf");
const getCountryList = async (req, res) => {
    const data = await Country.findAll({
        attributes: ["bt_country_id", "name", "short_name"],
    });
    res.status(StatusCodes.OK).json(data);
};

//get zipcodes
const getZipcodeList = async (req, res) => {
    const data = await Zipcode.findAll({
        attributes: ["bt_zipcodes_id", "zipcode", "city", "county"],
    });
    res.status(StatusCodes.OK).json(data);
};

//get phonetype
const getphoneTypeList = async (req, res) => {
    const data = await PhoneType.findAll({
        attributes: ["bt_phone_type_id", "name"],
    });
    res.status(StatusCodes.OK).json(data);
};

//get licensetype
const getlicenseTypeList = async (req, res) => {
    const data = await LicenseType.findAll({
        attributes: ["bp_license_type_id", "name"],
    });
    res.status(StatusCodes.OK).json(data);
};

//get regions
const getregionTypeList = async (req, res) => {
    const data = await Region.findAll({
        attributes: ["bt_region_id", "name"],
    });
    res.status(StatusCodes.OK).json(data);
};

//get investortype
const getinvestorTypeList = async (req, res) => {
    const data = await InvestorType.findAll({
        attributes: ["bp_investor_type_id", "name"],
    });
    res.status(StatusCodes.OK).json(data);
};
//get licensetype design
const getlicenseTypedesignList = async (req, res) => {
    const data = await LicenseTypedesign.findAll({
        attributes: ["bp_license_type_desig", "name"],
    });
    res.status(StatusCodes.OK).json(data);
};

//get entity type
const getentityTypeList = async (req, res) => {
    const data = await EntityType.findAll({
        attributes: ["bp_entity_type_id", "name"],
    });
    res.status(StatusCodes.OK).json(data);
};

//get userassociation
const getuserassociationList = async (req, res) => {
    const data = await UserAssociationType.findAll({
        attributes: ["bp_user_association_id", "name"],
    });
    res.status(StatusCodes.OK).json(data);
};

//register cannabiss business
const registerBusiness = async (req, res) => {
    const user = await User.findOne({ where: { email: req.user.email } });

    const state = await Region.findOne({
        where: { bt_region_id: req.body.basic_details.state_of_incorporation },
    });
    if (!state) {
        throw new BadRequestError("enter a valid id");
    }
    //checking business already registred
    const name = await Business.findOne({
        where: { name: req.body.basic_details.name },
    });
    if (name) {
        throw new BadRequestError("business already registred");
    }
    const basicDetails = await Business.create({
        name: req.body.basic_details.name,
        dba: req.body.basic_details.dba,
        fedtaxid: req.body.basic_details.fedtaxid,
        createdby: user.fullName,
        updatedby: user.fullName,
        is_createdby_stdc: "Y",
        is_cannabis_business: req.body.is_cannabis_business,
        state_id: state.id,
        user_id: user.id,
    });
    if (req.body.is_cannabis_business === "Y") {
        const license = await LicenseType.findOne({
            where: {
                bp_license_type_id:
                    req.body.cannabis_related_details.cannabis_business_type,
            },
        });
        if (!license) {
            throw new BadRequestError("enter a valid id");
        }
        const licenseType = await LicenseTypedesign.findOne({
            where: {
                bp_license_type_desig_id:
                    req.body.cannabis_related_details.cannabis_license_category,
            },
        });
        if (!licenseType) {
            throw new BadRequestError("enter a valid id");
        }
        const country = await Country.findOne({
            where: {
                bt_country_id:
                    req.body.cannabis_related_details.cannabis_licensed_country,
            },
        });
        if (!country) {
            throw new BadRequestError("enter a valid id");
        }
        const license_state = await Region.findOne({
            where: {
                bt_region_id:
                    req.body.cannabis_related_details.cannabis_licensed_state,
            },
        });
        if (!license_state) {
            throw new BadRequestError("enter a valid id");
        }
        await License.create({
            is_active: "Y",
            createdBy: basicDetails.createdby,
            updatedBy: basicDetails.updatedby,
            business_id: basicDetails.business_id,
            license_no: req.body.cannabis_related_details.license_number,
            license_type_id: license.id,
            license_type: license.name,
            cannabis_license_id: licenseType.id,
            country_id: country.id,
            license_state_region_id: license_state.id,
        });
    }
    const zipcode = await Zipcode.findOne({
        where: { zipcode: req.body.contact_details.legal_address.zipcode },
    });
    if (!zipcode) {
        throw new BadRequestError("enter a valid zipcode");
    }

    const address1 = `${basicDetails.name},${req.body.contact_details.legal_address.street_no} ${req.body.contact_details.legal_address.street_name},${zipcode.city},${zipcode.county},${zipcode.zipcode}`;
    const addressdata = {
        is_active: "Y",
        createdBy: user.fullName,
        updatedBy: user.fullName,
        zipcode: req.body.contact_details.legal_address.zipcode,
        zipcodes_id: zipcode.id,
        street_no: req.body.contact_details.legal_address.street_no,
        address1: address1,
        business_id: basicDetails.business_id,
        street_name: req.body.contact_details.legal_address.street_name,
    };
    const addressDetails = await Address.create(addressdata);
    console.log("hi");

    const phone_type = await PhoneType.findOne({
        where: {
            bt_phone_type_id: req.body.contact_details.legal_address.phone_type,
        },
    });
    if (!phone_type) {
        throw new BadRequestError("enter a valid id");
    }

    await Phones.create({
        is_active: "Y",
        createdBy: user.fullName,
        updatedBy: user.fullName,
        phone: req.body.contact_details.legal_address.phone_number,
        phone_type_id: phone_type.id,
        business_id: basicDetails.business_id,
    });
    if (
        req.body.contact_details.business_location
            .is_business_location_sameas_legal_address === "Y"
    ) {
        await Business_address.create({
            address2: addressDetails.address1,
            is_active: "Y",
            createdBy: user.fullName,
            updatedBy: user.fullName,
            zipcode: addressDetails.zipcode,
            zipcodes_id: addressDetails.id,
            street_no: addressDetails.street_no,
            business_id: basicDetails.business_id,
            street_name: addressDetails.street_name,
        });
    } else {
        const zipcodeData = await Zipcode.findOne({
            where: {
                zipcode: req.body.contact_details.business_location.zipcode,
            },
        });
        if (!zipcode) {
            throw new BadRequestError("enter a valid id");
        }
        const address_ = `${basicDetails.name},${
            req.body.contact_details.business_location.street_no
        } ${
            req.body.contact_details.business_location.street_name
        },${await zipcodeData.city},${await zipcodeData.county},${await zipcodeData.zipcode}`;

        await Business_address.create({
            address2: address_,
            is_active: "Y",
            createdBy: user.fullName,
            updatedBy: user.fullName,
            zipcode: req.body.contact_details.business_location.zipcode,
            zipcodes_id: zipcode.id,
            street_no: req.body.contact_details.business_location.street_no,
            business_id: basicDetails.business_id,
            street_name: req.body.contact_details.business_location.street_name,
        });
    }

    //keyregistration
    const user_association = await UserAssociationType.findOne({
        where: { name: "Controlling Managers & Operators" },
    });

    await User_Association.create({
        is_active: "Y",
        createdBy: user.fullName,
        updatedBy: user.fullName,
        name: user.fullName,
        email: user.email,
        description: "Controlling Managers & Operators",
        user_assoc_id: user_association.id,
        ownership_percent: 0,
        user_assoc_role: "Admin",
        user_id: user.id,
        business_id: basicDetails.business_id,
        is_contact_person: "Y",
    });
    if (req.body.key_person_registration.add_user === "Y") {
        req.body.key_person_registration.user.map(async (data) => {
            const user_assoc = await UserAssociationType.findOne({
                where: { bp_user_association_id: data.user_type },
            });
            if (!user_assoc) {
                throw new BadRequestError("enter a valid id");
            }
            if (data.user_type === "7cf77242-181c-45a2-94a5-2728974e8805") {
                await User_Association.create({
                    is_active: "Y",
                    createdBy: user.fullName,
                    updatedBy: user.fullName,
                    name: data.name,
                    email: data.email,
                    description: "Beneficial owner",
                    ownership_percent: data.ownership_percentage,
                    user_assoc_role: data.access_type,
                    user_id: user.id,
                    business_id: basicDetails.business_id,
                    user_assoc_id: user_assoc.id,
                    is_contact_person: data.set_as_contact_person,
                });
            }

            if (data.user_type === "ca51143d-9486-478b-a1cd-8051d682b7e0") {
                await User_Association.create({
                    is_active: "Y",
                    createdBy: user.fullName,
                    updatedBy: user.fullName,
                    name: data.name,
                    email: data.email,
                    description: "Controlling Managers & Operators",
                    ownership_percent: 0,
                    user_assoc_role: data.access_type,
                    user_id: user.id,
                    business_id: basicDetails.business_id,
                    user_assoc_id: user_assoc.id,
                    is_contact_person: data.set_as_contact_person,
                });
            }

            if (data.user_type === "f63eda23-26fc-4594-b398-813c82f3e33b") {
                // eslint-disable-next-line no-unused-vars
                const investorType = await InvestorType.findOne({
                    where: { bp_investor_type_id: data.investor_type },
                });
                if (!investorType) {
                    throw new BadRequestError("enter a valid id");
                }
                await User_Association.create({
                    is_active: "Y",
                    createdBy: user.fullName,
                    updatedBy: user.fullName,
                    name: data.name,
                    email: data.email,
                    description: "Investor",
                    ownership_percent: 0,
                    user_assoc_role: data.access_type,
                    user_id: user.id,
                    business_id: basicDetails.business_id,
                    investor_type_id: investorType.id,
                    user_assoc_id: user_assoc.id,
                    is_contact_person: data.set_as_contact_person,
                });
            }
        });
    }
    await Stage_Statuses.create({
        user_id: user.id,
        createdBy: user.fullName,
        updatedBy: user.fullName,
        business_id: basicDetails.business_id,
        business_profile: "complete",
    });
    await business_history.create({
        is_active: "Y",
        createdBy: user.id,
        updatedBy: user.id,
        user_id: user.id,
        business_id: basicDetails.business_id,
        description: "Business registered successfully",
    });

    res.status(StatusCodes.CREATED).json({
        id: basicDetails.business_id,
        business_name: basicDetails.name,
        address: addressDetails.address1,
    });
};

//get all business
const getAllBusiness = async (req, res) => {
    const { page, size, search, sortKey, sortOrder, filterby } = req.query;
    //searching
    // eslint-disable-next-line no-var
    var condition = search
        ? {
              [Op.or]: [
                  { dba: { [Op.like]: `%${search}%` } },
                  // eslint-disable-next-line no-undef
                  { name: { [Op.like]: `%${search}%` } },
              ],
          }
        : null;
    const { limit, offset } = paginate.getPagination(page, size);
    // eslint-disable-next-line no-unused-vars
    const preference = await User_preferences.update(
        {
            sortKey: sortKey,
            sortOrder: sortOrder,
            filterby: filterby,
        },
        { where: { pref_name: "business_list" } }
    );

    const preferences = await User_preferences.findOne({
        pref_name: "business_list",
    });
    if (preferences.filterby === "cannabis") {
        const business = await Business.findAndCountAll({
            attributes: [
                "business_id",
                "name",
                "dba",
                "createdAt",
                "is_approved",
                "is_approved_vendor",
                "is_cannabis_business",
                "is_createdby_stdc",
            ],
            where: {
                [Op.and]: [{ is_cannabis_business: "Y" }, condition],
            },
            include: [
                {
                    model: Stage_Statuses,
                    attributes: ["membership", "status_id"],
                },
            ],
            limit,
            offset,
            order: [[preferences.sortKey, preferences.sortOrder]],
            // eslint-disable-next-line no-dupe-keys
            attributes: [
                "business_id",
                "name",
                "dba",
                "createdAt",
                "is_approved",
                "is_approved_vendor",
                "is_cannabis_business",
                "is_createdby_stdc",
            ],
        });
        const response = paginate.getPagingData(
            business,
            page,
            limit,
            sortOrder,
            filterby
        );
        res.status(StatusCodes.OK).json(response);
    }

    //filterby non-cannabis business
    if (preferences.filterby === "non-cannabis") {
        const business = await Business.findAndCountAll({
            attributes: [
                "business_id",
                "name",
                "dba",
                "createdAt",
                "is_approved",
                "is_approved_vendor",
                "is_cannabis_business",
                "is_createdby_stdc",
            ],
            where: {
                [Op.and]: [{ is_cannabis_business: "N" }, condition],
            },
            include: [
                {
                    model: Stage_Statuses,
                    attributes: ["membership", "status_id"],
                },
            ],
            limit,
            offset,
            order: [[preferences.sortKey, preferences.sortOrder]],
            // eslint-disable-next-line no-dupe-keys
            attributes: [
                "business_id",
                "name",
                "dba",
                "createdAt",
                "is_approved",
                "is_approved_vendor",
                "is_cannabis_business",
                "is_createdby_stdc",
            ],
        });

        const response = paginate.getPagingData(
            business,
            page,
            limit,
            sortOrder,
            filterby
        );
        res.status(StatusCodes.OK).json(response);
    }
    //filter by approved vendor
    if (preferences.filterby === "approved vendor") {
        const business = await Business.findAndCountAll({
            attributes: [
                "business_id",
                "name",
                "dba",
                "createdAt",
                "is_approved",
                "is_approved_vendor",
                "is_cannabis_business",
                "is_createdby_stdc",
            ],
            where: {
                [Op.and]: [{ is_approved_vendor: "Y" }, condition],
            },
            include: [
                {
                    model: Stage_Statuses,
                    attributes: ["membership", "status_id"],
                },
            ],
            limit,
            offset,
            order: [[preferences.sortKey, preferences.sortOrder]],
            // eslint-disable-next-line no-dupe-keys
            attributes: [
                "business_id",
                "name",
                "dba",
                "createdAt",
                "is_approved",
                "is_approved_vendor",
                "is_cannabis_business",
                "is_createdby_stdc",
            ],
        });

        // eslint-disable-next-line no-undef
        const response = paginate.getPagingData(business, page, limit);
        res.status(StatusCodes.OK).json(response);
    }
    if (preferences.filterby === "all") {
        const business = await Business.findAndCountAll({
            attributes: [
                "business_id",
                "name",
                "dba",
                "createdAt",
                "is_approved",
                "is_approved_vendor",
                "is_cannabis_business",
                "is_createdby_stdc",
            ],

            where: condition,
            include: [
                {
                    model: Stage_Statuses,
                    attributes: ["membership", "status_id"],
                },
            ],
            limit,
            offset,
            order: [[preferences.sortKey, preferences.sortOrder]],
            // eslint-disable-next-line no-dupe-keys
            attributes: [
                "business_id",
                "name",
                "dba",
                "createdAt",
                "is_approved",
                "is_approved_vendor",
                "is_cannabis_business",
                "is_createdby_stdc",
            ],
        });

        const response = paginate.getPagingData(business, page, limit);

        res.status(StatusCodes.OK).json(response);
    }
};
//get one business details
const oneBusiness = async (req, res) => {
    const user = await User.findOne({ where: { id: req.params.id } });
    if (!user) {
        throw new CustomAPIError("user not found");
    }
    const business = await Business.findOne({
        where: { user_id: user.id },
        attributes: [
            "business_id",
            "name",
            "dba",
            "fedtaxid",
            "createdAt",
            "is_approved",
            "is_approved_vendor",
            "is_cannabis_business",
            "is_createdby_stdc",
        ],
        include: [
            {
                model: User_Association,
                attributes: [
                    "name",
                    "user_id",
                    "email",
                    "business_user_assoc_id",
                    "description",
                    "user_assoc_role",
                    "ownership_percent",
                ],
            },
            {
                model: Stage_Statuses,
                attributes: [
                    "status_id",
                    "membership",
                    "standardc_due_diligence",
                    "business_kyc_cdd",
                    "business_profile",
                ],
            },
            {
                model: Address,
                attributes: ["address_id", "street_no", "address2", "zipcode"],
            },
            { model: Phones, attributes: ["phone", "business_phone_id"] },
            {
                model: License,
                attributes: [
                    "business_license_id",
                    "license_no",
                    "license_type",
                ],
            },
        ],
    });
    res.status(StatusCodes.OK).json(business);
};
//view and edit business
const viewBusiness = async (req, res) => {
    const { page, size } = req.query;

    const { limit, offset } = paginate.getPagination(page, size);
    const user = await User.findOne({ where: { email: req.user.email } });
    const list = await Business.findAndCountAll({
        where: { user_id: user.id },
        attributes: [
            "business_id",
            "name",
            "dba",
            "isactive",
            "is_cannabis_business",
        ],
        limit,
        offset,
    });

    // eslint-disable-next-line no-undef
    const response = paginate.getPagingData(list, page, limit);
    res.status(StatusCodes.OK).json(response);
};

//edit viewable business

const editBusiness = async (req, res) => {
    const user = await User.findOne({ where: { email: req.user.email } });
    const business = await Business.findOne({
        where: { business_id: req.params.id },
    });
    const role = await User_Association.findOne({
        where: { user_id: user.id },
    });

    //checking wheather the user is admin or not
    if (role.user_assoc_role !== "Admin") {
        throw new UnauthorizedError("cannot access to perform this action");
    }

    //edit basic details
    if (req.body.basic_details) {
        // eslint-disable-next-line no-unused-vars
        const basicDetails = await Business.update(
            {
                name: req.body.basic_details.name,
                dba: req.body.basic_details.dba,
                fedtaxid: req.body.basic_details.fedtaxid,
                updatedby: user.id,
            },
            { where: { business_id: req.params.id } }
        );

        //edit state
        if (req.body.basic_details.state) {
            const state = await Region.findOne({
                where: {
                    bt_region_id: req.body.basic_details.state_of_incorporation,
                },
            });
            if (!state) {
                throw new BadRequestError("enter a valid id");
            }
            await Business.update(
                { state_id: state.id },
                { where: { business_id: req.params.id } }
            );
        }
        await business_history.create({
            is_active: "Y",
            createdBy: user.id,
            updatedBy: user.id,
            user_id: user.id,
            business_id: business.business_id,
            description: "Basic details updated",
        });
    }
    //edit cannabis reated details
    if (business.is_cannabis_business === "Y") {
        if (req.body.cannabis_related_details) {
            await License.update(
                {
                    updatedBy: user.id,
                    license_no:
                        req.body.cannabis_related_details.license_number,
                },
                { where: { business_id: req.params.id } }
            );
            //edit cannabis business type
            if (req.body.cannabis_related_details.cannabis_business_type) {
                const license = await LicenseType.findOne({
                    where: {
                        bp_license_type_id:
                            req.body.cannabis_related_details
                                .cannabis_business_type,
                    },
                });
                if (!license) {
                    throw new BadRequestError("enter a valid id");
                }
                await License.update(
                    { license_type_id: license.id, license_type: license.name },
                    { where: { business_id: req.params.id } }
                );
            }
            if (req.body.cannabis_related_details.cannabis_license_category) {
                const licenseType = await LicenseTypedesign.findOne({
                    where: {
                        bp_license_type_desig_id:
                            req.body.cannabis_related_details
                                .cannabis_license_category,
                    },
                });
                if (!licenseType) {
                    throw new BadRequestError("enter a valid id");
                }
                await License.update(
                    { cannabis_license_id: licenseType.id },
                    { where: { business_id: req.params.id } }
                );
            }
            if (req.body.cannabis_related_details.cannabis_licensed_country) {
                const country = await Country.findOne({
                    where: {
                        bt_country_id:
                            req.body.cannabis_related_details
                                .cannabis_licensed_country,
                    },
                });
                if (!country) {
                    throw new BadRequestError("enter a valid id");
                }
                await License.update(
                    { country_id: country.id },
                    { where: { business_id: req.params.id } }
                );
            }
            if (req.body.cannabis_related_details.cannabis_licensed_state) {
                const license_state = await Region.findOne({
                    where: {
                        bt_region_id:
                            req.body.cannabis_related_details
                                .cannabis_licensed_state,
                    },
                });
                if (!license_state) {
                    throw new BadRequestError("enter a valid id");
                }
                await License.update(
                    { license_state_region_id: license_state.id },
                    { where: { business_id: req.params.id } }
                );
            }
            await business_history.create({
                is_active: "Y",
                createdBy: user.id,
                updatedBy: user.id,
                user_id: user.id,
                business_id: business.business_id,
                description: "Cannabis details updated",
            });
        }
    }
    //edit contact details
    if (req.body.contact_details) {
        if (req.body.contact_details.legal_address) {
            if (req.body.contact_details.legal_address.zipcode) {
                const zipcode = await Zipcode.findOne({
                    where: {
                        zipcode: req.body.contact_details.legal_address.zipcode,
                    },
                });
                if (!zipcode) {
                    throw new BadRequestError("enter a valid zipcode");
                }
                const address = await Business_address.findOne({
                    where: { business_id: business.business_id },
                });
                // eslint-disable-next-line no-var
                var new_business = await Business.findOne({
                    where: { business_id: req.params.id },
                });
                const address1 = `${new_business.name},${address.street_no} ${address.street_name},${zipcode.city},${zipcode.county},${zipcode.zipcode}`;
                await Address.update(
                    {
                        updatedBy: user.id,
                        zipcode: req.body.contact_details.legal_address.zipcode,
                        zipcodes_id: zipcode.id,
                        address1: address1,
                    },
                    { where: { business_id: req.params.id } }
                );
            }
            if (req.body.contact_details.legal_address.streetname) {
                const address = await Business_address.findOne({
                    where: { business_id: business.business_id },
                });
                const address1 = `${new_business.name},${address.street_no} ${req.body.contact_details.legal_address.street_name},${address.city},${address.county},${address.zipcode}`;
                await Address.update(
                    {
                        updatedBy: user.id,
                        street_name:
                            req.body.contact_details.legal_address.street_name,
                        address1: address1,
                    },
                    { where: { business_id: req.params.id } }
                );
            }
            if (req.body.contact_details.legal_address.street_no) {
                const address = await Address.findOne({
                    where: { business_id: business.business_id },
                });
                const address1 = `${new_business.name},${req.body.contact_details.legal_address.street_no} ${address.street_name},${address.city},${address.county},${address.zipcode}`;
                await Address.update(
                    {
                        updatedBy: user.id,
                        street_no:
                            req.body.contact_details.legal_address.street_no,
                        address1: address1,
                    },
                    { where: { business_id: req.params.id } }
                );
            }
            if (req.body.contact_details.legal_address.phone_type) {
                const phone_type = await PhoneType.findOne({
                    where: {
                        bt_phone_type_id:
                            req.body.contact_details.legal_address.phone_type,
                    },
                });
                if (!phone_type) {
                    throw new BadRequestError("enter a valid id");
                }
                await Phones.update(
                    {
                        updatedBy: user.id,
                        phone: req.body.contact_details.legal_address
                            .phone_number,
                        phone_type_id: phone_type.id,
                    },
                    { where: { business_id: req.params.id } }
                );
            }
            await business_history.create({
                is_active: "Y",
                createdBy: user.id,
                updatedBy: user.id,
                user_id: user.id,
                business_id: business.business_id,
                description: "Legal Address details updated",
            });
        }
        if (req.body.contact_details.business_location) {
            if (
                req.body.contact_details.business_location
                    .is_business_location_sameas_legal_address === "N"
            ) {
                const zipcodeData = await Zipcode.findOne({
                    where: {
                        zipcode:
                            req.body.contact_details.business_location.zipcode,
                    },
                });
                if (!zipcodeData) {
                    throw new BadRequestError("enter a valid id");
                }
                await Business_address.update(
                    {
                        updatedBy: user.id,
                        zipcode:
                            req.body.contact_details.business_location.zipcode,
                        zipcodes_id: zipcodeData.id,
                        streetname:
                            req.body.contact_details.business_location
                                .street_name,
                        street_no:
                            req.body.contact_details.business_location
                                .street_no,
                    },
                    {
                        where: { business_id: business.business_id },
                    }
                );
                const address = await Business_address.findOne({
                    where: { business_id: business.business_id },
                });
                const address_ = `${new_business.name},${
                    req.body.contact_details.business_location.street_no
                } ${
                    req.body.contact_details.business_location.street_name
                },${await address.city},${await address.county},${await address.zipcode}`;
                await Business_address.update(
                    {
                        address2: address_,
                    },
                    {
                        where: { business_id: business.business_id },
                    }
                );
            } else {
                const address = await Address.findOne({
                    where: {
                        business_id: business.business_id,
                    },
                });
                await Business_address.update(
                    {
                        address2: address.address1,
                        updatedBy: user.id,
                        zipcode: address.zipcode,
                        zipcodes_id: address.id,
                        streetname: address.street_name,
                        street_no: address.street_no,
                    },
                    {
                        where: { business_id: business.business_id },
                    }
                );
            }
            await business_history.create({
                is_active: "Y",
                createdBy: user.id,
                updatedBy: user.id,
                user_id: user.id,
                business_id: business.business_id,
                description: "Business  details updated",
            });
        }
    }
    res.status(StatusCodes.OK).json({
        message: "business details updated",
    });
};
// keyperson details add,edit,delete
const adduser = async (req, res) => {
    const user = await User.findOne({ where: { email: req.user.email } });
    const business = await Business.findOne({
        where: { business_id: req.params.id },
    });
    //const role = await User_Association.findOne({where : {user_id :user.id }});
    if (req.body.key_person_registration) {
        if (req.body.key_person_registration.add_user === "Y") {
            req.body.key_person_registration.user.map(async (data) => {
                const user_assoc = await UserAssociationType.findOne({
                    where: { bp_user_association_id: data.user_type },
                });
                if (!user_assoc) {
                    throw new BadRequestError("enter a valid id");
                }
                if (data.user_type === "7cf77242-181c-45a2-94a5-2728974e8805") {
                    await User_Association.create({
                        is_active: "Y",
                        createdBy: user.id,
                        updatedBy: user.id,
                        name: data.name,
                        email: data.email,
                        description: "Beneficial owner",
                        ownership_percent: data.ownership_percentage,
                        user_assoc_role: data.access_type,
                        user_id: user.id,
                        business_id: business.business_id,
                        user_assoc_id: user_assoc.id,
                        is_contact_person: data.set_as_contact_person,
                    });
                }

                if (data.user_type === "ca51143d-9486-478b-a1cd-8051d682b7e0") {
                    await User_Association.create({
                        is_active: "Y",
                        createdBy: user.id,
                        updatedBy: user.id,
                        name: data.name,
                        email: data.email,
                        description: "Controlling Managers & Operators",
                        ownership_percent: 0,
                        user_assoc_role: data.access_type,
                        user_id: user.id,
                        business_id: business.business_id,
                        user_assoc_id: user_assoc.id,
                        is_contact_person: data.set_as_contact_person,
                    });
                }

                if (data.user_type === "f63eda23-26fc-4594-b398-813c82f3e33b") {
                    // eslint-disable-next-line no-unused-vars
                    const investorType = await InvestorType.findOne({
                        where: { bp_investor_type_id: data.investor_type },
                    });
                    if (!investorType) {
                        throw new BadRequestError("enter a valid id");
                    }
                    await User_Association.create({
                        is_active: "Y",
                        createdBy: user.id,
                        updatedBy: user.id,
                        name: data.name,
                        email: data.email,
                        description: "Investor",
                        ownership_percent: 0,
                        user_assoc_role: data.access_type,
                        user_id: user.id,
                        business_id: business.business_id,
                        investor_type_id: investorType.id,
                        user_assoc_id: user_assoc.id,
                        is_contact_person: data.set_as_contact_person,
                    });
                }
            });
        }
        await business_history.create({
            is_active: "Y",
            createdBy: user.id,
            updatedBy: user.id,
            user_id: user.id,
            business_id: business.business_id,
            description: "User added",
        });
    }
    res.status(StatusCodes.OK).json({
        message: "user added successfuly",
    });
};
//edit user details
const edituser = async (req, res) => {
    const user = await User.findOne({ where: { email: req.user.email } });
    const business = await Business.findOne({
        where: { business_id: req.params.id },
    });
    const role = await User_Association.findOne({
        where: { user_id: user.id },
    });

    //checking wheather the user is admin or not
    if (role.user_assoc_role !== "Admin") {
        throw new UnauthorizedError("cannot access to perform this action");
    }
    if (req.body.key_person_registration.edit_users) {
        req.body.key_person_registration.edit_users.map(async (data) => {
            const user_assoc = await UserAssociationType.findOne({
                where: { bp_user_association_id: data.user_type },
            });
            if (!user_assoc) {
                throw new BadRequestError("enter a valid id");
            }
            if (data.user_type === "7cf77242-181c-45a2-94a5-2728974e8805") {
                await User_Association.update(
                    {
                        updatedBy: user.id,
                        name: data.name,
                        email: data.email,
                        description: "Beneficial owner",
                        ownership_percent: data.ownership_percentage,
                        user_assoc_role: data.access_type,
                        is_contact_person: data.set_as_contact_person,
                    },
                    { where: { business_user_assoc_id: data.id } }
                );
            }

            if (data.user_type === "ca51143d-9486-478b-a1cd-8051d682b7e0") {
                await User_Association.update(
                    {
                        updatedBy: user.id,
                        name: data.name,
                        email: data.email,
                        description: "Controlling Managers & Operators",
                        ownership_percent: 0,
                        user_assoc_role: data.access_type,
                        is_contact_person: data.set_as_contact_person,
                    },
                    { where: { business_user_assoc_id: data.id } }
                );
            }

            if (data.user_type === "f63eda23-26fc-4594-b398-813c82f3e33b") {
                // eslint-disable-next-line no-unused-vars
                const investorType = await InvestorType.findOne({
                    where: { bp_investor_type_id: data.investor_type },
                });
                if (!investorType) {
                    throw new BadRequestError("enter a valid id");
                }
                await User_Association.update(
                    {
                        updatedBy: user.id,
                        name: data.name,
                        email: data.email,
                        description: "Investor",
                        ownership_percent: 0,
                        user_assoc_role: data.access_type,
                        is_contact_person: data.set_as_contact_person,
                    },
                    { where: { business_user_assoc_id: data.id } }
                );
            }
            await business_history.create({
                is_active: "Y",
                createdBy: user.id,
                updatedBy: user.id,
                user_id: user.id,
                business_id: business.business_id,
                description: "User details updated",
            });
        });
    }
    res.status(StatusCodes.OK).json({
        message: "user details updated successfuly",
    });
};
//delete user
const deleteUser = async (req, res) => {
    await User_Association.destroy({
        where: { business_user_assoc_id: req.body.id },
    });
    await business_history.create({
        is_active: "Y",
        createdBy: req.user.id,
        updatedBy: req.user.id,
        user_id: req.user.id,
        business_id: req.params.id,
        description: "User details deleted",
    }),
        res.status(StatusCodes.OK).json({
            message: "deleted successfuly",
        });
};
//export businesshistory as csv file
const businessHistoryCsv = async (req, res) => {
    const id = req.params.id;

    const business_name = await Business.findOne({ where: { user_id: id } });
    const business = await business_history.findAll({
        
        where: {
            user_id: id,
            [Op.and]:[ 
                Sequelize.where(
                    Sequelize.fn("date", Sequelize.col("business_history.createdAt")),
                    ">=",
                    req.body.from
                ),
                Sequelize.where(
                    Sequelize.fn("date", Sequelize.col("business_history.createdAt")),
                    "<=",
                    req.body.to
                ),
            ],
        },
        include: [
            {
                model: User,
              // attributes:[]
                    //exclude:["updatedAt","createdAt","id","imageUrl","passwordExpiry","phone","address","email","image"],
                //}
            },
        ],
        attributes: [
        [Sequelize.fn('to_char', Sequelize.col('business_history.createdAt'), 'YYYY-mm-dd,HH24:MI:SS'), 'createdAt'],
        "description",
       //[Sequelize.literal('"user"."firstName"'),"firstName"]
       //[Sequelize.fn('date_format', Sequelize.col('createdAt'), '%m-%d-%Y %H:%i:%s'), 'createdAt']],
       //[Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"),"%d-%m-%Y %H:%i:%s"),"date_n"]
    ],
    });
    if (!business) {
        throw new CustomAPIError("Business not found");
    }

    const data = [];
    for (const value of business) {
        //const user = await User.findOne({ where: { id: value.updatedBy } });
        data.push({
            createdAt: value.createdAt,
            description: value.description,
            updatedBy: value.user.fullName,
        });
    }
    const fields=[
        {
            value: "createdAt",
            label: "Date",
        },
        {
            value: "description",
            label: "Description",
        },
        {
            value: "firstName",
            label: "Updated By",
        },
    ]
    const stream = new ReadableStream();
    stream.push(JSON.stringify(data));
    stream.push(null);

    const json2csv = new Json2csvTransform({}, fields);
    res.writeHead(200,{
        'Content-Type': 'application/csv',
        'Content-Disposition': `attachment;filename=business_history_${business_name.name}.csv`,
      });
    stream.pipe(json2csv).pipe(res);
    // const stream = res.writeHead(200,{
    //     'Content-Type': 'application/csv',
    //     'Content-Disposition': `attachment;filename=business_history_${business_name.name}.csv`,
    //   });
    //   csvExport(
    //     data,
    //     (data) => stream.write(data),
    //     () => stream.end()
    //   );
    res.status(StatusCodes.OK).json({ message: "file exported" });
};

//export businesshistory as pdf
const businessHistoryPdf = async (req, res) => {
    const id = req.params.id;

    const business_name = await Business.findOne({ where: { user_id: id } });
    const business = await business_history.findAll({
        
        where: {
            user_id: id,
            [Op.and]:[ 
                Sequelize.where(
                    Sequelize.fn("date", Sequelize.col("business_history.createdAt")),
                    ">=",
                    req.body.from
                ),
                Sequelize.where(
                    Sequelize.fn("date", Sequelize.col("business_history.createdAt")),
                    "<=",
                    req.body.to
                ),
            ],
        },
        include: [
            {
                model: User,
                //attributes:[]
                    //exclude:["updatedAt","createdAt","id","imageUrl","passwordExpiry","phone","address","email","image"],
                //}
            },
        ],
        attributes: [
        [Sequelize.fn('to_char', Sequelize.col('business_history.createdAt'), 'YYYY-mm-dd,HH24:MI:SS'), 'createdAt'],
        "description"
        //[Sequelize.literal('"user"."firstName"'),"firstName"]
       // [Sequelize.fn('date_format', Sequelize.col('createdAt'), '%m-%d-%Y %H:%i:%s'), 'createdAt']],
        //[Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"),"%d-%m-%Y %H:%i:%s"),"date_n"]
    ],
    });
    if (!business) {
        throw new CustomAPIError(" Business not found");
    }
    
    // const data = [];
    // for (const value of business) {
    //    // console.log(business.firstName);
    //    // const user = await User.findOne({ where: { id: value.updatedBy } });
    //     data.push({
    //         createdAt: value.createdAt,
    //         description: value.description,
    //         firstName: await value.user.fullName,
    //     });
    //     console.log(data);
    //  }
    const stream = res.writeHead(200,{
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=business_history_${business_name.name}.pdf`,
      });
      await pdfExport.buildPDF(
        business_name.name,business,
        (data) => stream.write(data),
        () => stream.end()
      );

    //res.status(StatusCodes.OK).json(business)
};

module.exports = {
    getCountryList,
    getZipcodeList,
    getphoneTypeList,
    getlicenseTypeList,
    getregionTypeList,
    getinvestorTypeList,
    getlicenseTypedesignList,
    getentityTypeList,
    getuserassociationList,
    registerBusiness,
    getAllBusiness,
    oneBusiness,
    viewBusiness,
    editBusiness,
    adduser,
    edituser,
    deleteUser,
    businessHistoryCsv,
    businessHistoryPdf,
};