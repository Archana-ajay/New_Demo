"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class invite extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate() {
            //define association here
        }
    }
    invite.init(
        {
            name: DataTypes.STRING,
            email:{ type: DataTypes.STRING,
                unique:true},
            status: {
                
                type:DataTypes.STRING,
                values: ["waiting", "completed"],
                defaultValue: "waiting"},
            action:{ type:DataTypes.BOOLEAN,
                defaultValue:true},
            createdat: {
                    type: "TIMESTAMP",
                    defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
                    allowNull: false,
                  },
        },
        {
            sequelize,
            modelName: "invite",
            timestamps:true
        }
    );
    return invite;
};