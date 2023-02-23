const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class License extends Model {
        // Helper method for defining associations.
        // This method is not a part of Sequelize lifecycle.
        // The `models/index` file will call this method automatically.
        static associate() {}
    }
    License.init(
        {
            business_license_id: {
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
            business_id: {
                type: DataTypes.UUID,
            },
            license_no: {
                type: DataTypes.STRING,
            },
            license_type_id: {
                type: DataTypes.BIGINT,
            },
            license_type: {
                type: DataTypes.STRING,
            },
            license_state_region_id: {
                type: DataTypes.BIGINT,
            },
            country_id: {
                type: DataTypes.STRING,
            },
            cannabis_license_id: {
                type: DataTypes.BIGINT,
            },
        },
        {
            sequelize,
            modelName: License.name,
            tableName: "license",
            timestamps: true,
        }
    );

    return License;
};