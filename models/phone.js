const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Phones extends Model {
        // Helper method for defining associations.
        // This method is not a part of Sequelize lifecycle.
        // The `models/index` file will call this method automatically.
        static associate() {
           // Phones.belongsTo(model.Business, { foreignKey: "business_id" });
        }
    }
    Phones.init(
        {
            business_phone_id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
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
            phone: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            business_id: {
                type: DataTypes.UUID,
            },
            phone_type_id: {
                type: DataTypes.BIGINT,
            },
        },
        {
            sequelize,
            modelName: Phones.name,
            tableName: "phones",
            timestamps: true,
        }
    );

    return Phones;
};