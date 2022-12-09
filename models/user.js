"use strict";
const { Model } = require("sequelize");
const hi=require("../utils/pagination");
const { get } = require("../utils/sendmail");
const bucket=require('../utils/S3helper')
const moment = require('moment');
                                const a="hi"
                              const b="hello"

	


module.exports = (sequelize, DataTypes) => {
    class user extends Model {
        static associate() {
           //user.hasMany(model.user_password,{ foreignKey: 'id' });
            //define association here
        }
    }
    user.init(
        {
            firstName: DataTypes.STRING,
            lastName: DataTypes.STRING,
            fullName:{
                type:DataTypes.VIRTUAL,
                get(){
                    return this.getDataValue("firstName")+" "+this.getDataValue("lastName")
                }
            },
            email: DataTypes.STRING,
            phone: DataTypes.BIGINT,
            image:DataTypes.STRING,
            url:{
                type:DataTypes.VIRTUAL,
                  get(){
                        return bucket.getSignedURL(this.image)
            }},
            address: {
                type:DataTypes.JSON,

    
                
                // values:{
                //     city:DataTypes.STRING,
                //     country:DataTypes.STRING,
                //     state:DataTypes.STRING
                // }   
            },
            passwordExpiry:{ 
                type:DataTypes.DATEONLY,
            },
        },

        

        {
            sequelize,
            modelName: "user",
            timestamps:true
        },
    );
    user.prototype.test= function(){
        const a= bucket.getSignedURL(this.image)
        return a
        }
    return user;
};
