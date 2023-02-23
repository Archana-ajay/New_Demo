"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class user_Details extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate() {
            //define association here
        }
    }
    user_Details.init(
        {
            email: {
                type: DataTypes.STRING,
                unique: true,
            },
            emailInviteStatus: {
                type: DataTypes.STRING,
                values: ["sent", "failed"],
            },
            inviteSentAt: {
                type: DataTypes.DATE,
            },
            registerStatus: {
                type: DataTypes.STRING,
                values: ["waiting", "completed"],
                defaultValue: "waiting",
            },
            registerId: {
                type: DataTypes.UUID,
            },
            registeredAt: {
                type: DataTypes.DATE,
            },
            invitedBy: {
                type: DataTypes.STRING,
            },
        },
        {
            sequelize,
            modelName: "user_Details",
            timestamps: false,
        }
    );
    return user_Details;
};