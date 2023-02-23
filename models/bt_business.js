// eslint-disable-next-line no-unused-vars
const { Model, UUIDV4 } = require("sequelize");
const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
    class Business extends Model {
        // Helper method for defining associations.
        // This method is not a part of Sequelize lifecycle.
        // The `models/index` file will call this method automatically.
        static associate(model) {
            Business.hasMany(model.Stage_Statuses, {
                foreignKey: "business_id",
            });
            Business.hasOne(model.License, { foreignKey: "business_id" });
            Business.hasMany(model.User_Association, {
                foreignKey: "business_id",
            });
            Business.hasOne(model.Address, { foreignKey: "business_id" });
            Business.hasOne(model.Phones, { foreignKey: "business_id" });
        }
    }
    Business.init(
        {
            user_id: {
                type: DataTypes.UUID,
            },
            business_id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
            },
            isactive: {
                type: DataTypes.ENUM("Y", "N"),
                defaultValue: "Y",
            },
            createdby: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            updatedby: {
                type: DataTypes.STRING,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            is_approved: {
                type: DataTypes.ENUM("Y", "N"),
                defaultValue: "N",
            },
            dba: {
                type: DataTypes.STRING,
            },
            fedtaxid: {
                type: DataTypes.INTEGER,
            },
            is_cannabis_business: {
                type: DataTypes.ENUM("Y", "N"),
                defaultValue: "Y",
            },
            is_approved_vendor: {
                type: DataTypes.ENUM("Y", "N"),
                defaultValue: "N",
            },
            is_createdby_stdc: {
                type: DataTypes.ENUM("Y", "N"),
                defaultValue: "N",
            },
            state_id: {
                type: DataTypes.BIGINT,
            },
            createdAt:{
                type:DataTypes.DATE,
                get(){
                    return moment(this.createdAt).format("dd/mm/yyyy");
                }
            }
        },
        {
            sequelize,
            modelName: Business.name,
            tableName: "business",
            timestamps: true,
        }
    );

    return Business;
};