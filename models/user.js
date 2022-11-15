"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class user extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate() {
            //define association here
        }
    }
    user.init(
        {
            firstName: DataTypes.STRING,
            lastName: DataTypes.STRING,
            email: DataTypes.STRING,
            password: DataTypes.STRING,
            phone: DataTypes.BIGINT,
            address: {
                type:DataTypes.JSON,
                
                // values:{
                //     city:DataTypes.STRING,
                //     country:DataTypes.STRING,
                //     state:DataTypes.STRING
                // }     
            },
        },
        {
            sequelize,
            modelName: "user",
            timestamps:true
        },
    );
    return user;
};