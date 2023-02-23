/* eslint-disable no-var */
"use strict";

const { Model } = require("sequelize");
const bucket = require("../utils/S3helper");
module.exports = (sequelize, DataTypes) => {
    class user extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(model) {
            //define association here
           // user.hasMany(model.user_password, { foreignKey: "id" });
           user.hasMany(model.business_history, { foreignKey: "id"});
        }
    }
    user.init(
        {
            id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
            },
            firstName: DataTypes.STRING,
            lastName: DataTypes.STRING,
            email: DataTypes.STRING,
            address: DataTypes.JSON,
            phone: DataTypes.STRING,
            image: DataTypes.STRING,
            passwordExpiry: DataTypes.DATEONLY,
            fullName: {
                type: DataTypes.VIRTUAL,
                get() {
                    return (
                        this.getDataValue("firstName") +
                        " " +
                        this.getDataValue("lastName")
                    );
                },
            },
            imageUrl: {
                type: DataTypes.VIRTUAL,
                get() {
                    {
                        if (this.image !== null) {
                            var result = bucket.getSignedURL(this.image);
                            //console.log(result);
                            return result;
                        }
                    }
                },
            },
        },
        {
            sequelize,
            modelName: "user",
        }
    );
    return user;
};