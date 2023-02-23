"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class user_prefrences extends Model {
        // Helper method for defining associations.
        // This method is not a part of Sequelize lifecycle.
        // The `models/index` file will call this method automatically.
        static associate() {
           
        }
    }
    
    user_prefrences.init(
        {
            id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
            },
            pref_name: {
                type: DataTypes.STRING,
            },
            sortKey:{
                type: DataTypes.STRING,
            },
            sortOrder:{
                type: DataTypes.STRING,
            },
            filterby:{
                type: DataTypes.STRING
            },
            updatedBy: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            createdBy: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName: "user_prefrences",
            timestamps: true,
        }
    );

    return user_prefrences;
};