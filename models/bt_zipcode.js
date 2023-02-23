const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Zipcode extends Model {
        // Helper method for defining associations.
        // This method is not a part of Sequelize lifecycle.
        // The `models/index` file will call this method automatically.
        static associate() {}
    }
    Zipcode.init(
        {
            bt_zipcodes_id: {
                type: DataTypes.STRING,
            },
            isactive: {
                type: DataTypes.ENUM("Y", "N"),
                defaultValue: "Y",
            },
            created: {
                type: DataTypes.DATE,
            },
            createdby: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            updated: {
                type: DataTypes.DATE,
            },
            updatedby: {
                type: DataTypes.STRING,
            },
            city: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            county: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            bt_country_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            bt_region_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            zipcode: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: Zipcode.name,
            tableName: "zipcode",
            timestamps: false,
        }
    );

    return Zipcode;
};