"use strict";
const { Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    class user_password extends Model {
        // Helper method for defining associations.
        // This method is not a part of Sequelize lifecycle.
        // The `models/index` file will call this method automatically. 
        static associate() {
            //user_password.belongsTo(model.user, { foreignKey: 'userId' });
        }      
    }
    user_password.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.BIGINT,
            },
            password: {
                type: DataTypes.STRING,
            },
            createdBy: {
                type: DataTypes.STRING, 
                allowNull: false               
            },
            userId : {
                type: DataTypes.BIGINT,
            },
           
        },
        {
            sequelize,
            modelName: "user_password",
            timestamps:true
        }
    );

    return user_password;
};