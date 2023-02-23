// eslint-disable-next-line no-unused-vars
const { Model, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Business_address extends Model {
        // Helper method for defining associations.
        // This method is not a part of Sequelize lifecycle.
        // The `models/index` file will call this method automatically.
        static associate() {
            // Address.belongsTo(model.Business, {
            //     foreignKey: "business_id",
            // });
        }
    }

    Business_address.init(
        {
            business_address_id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
            },
            business_id: {
                type: DataTypes.UUID,
            },
            is_active: {
                type: DataTypes.ENUM("Y", "N"),
                defaultValue: "Y",
            },
            createdBy: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            updatedBy: {
                type: DataTypes.STRING,
            },
            address2: {
                type: DataTypes.STRING,
            },
            zipcodes_id: {
                type: DataTypes.BIGINT,
            },
            zipcode: {
                type: DataTypes.STRING,
            },
            street_no: {
                type: DataTypes.STRING,
            },
            street_name: {
                type: DataTypes.STRING,
            },
        },
        {
            sequelize,
            modelName: Business_address.name,
            tableName: "business_address",
            timestamps: true,
        }
    );

    return Business_address;
};