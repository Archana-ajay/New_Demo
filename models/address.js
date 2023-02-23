// eslint-disable-next-line no-unused-vars
const { Model, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Address extends Model {
        // Helper method for defining associations.
        // This method is not a part of Sequelize lifecycle.
        // The `models/index` file will call this method automatically.
        static associate(model) {
            Address.belongsTo(model.Business, {
                foreignKey: "business_id",
            });
        }
    }

    Address.init(
        {
            address_id: {
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
            address1: {
                type: DataTypes.STRING,
                allowNull: false,
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
        },
        {
            sequelize,
            modelName: Address.name,
            tableName: "address",
            timestamps: true,
        }
    );

    return Address;
};