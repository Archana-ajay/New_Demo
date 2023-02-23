const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class business_history extends Model {
        // Helper method for defining associations.
        // This method is not a part of Sequelize lifecycle.
        // The `models/index` file will call this method automatically.
        static associate(model) {
            business_history.belongsTo(model.user, { foreignKey: "user_id"});
            business_history.belongsTo(model.Business, {
                foreignKey: "business_id",
            });
        }
    }
    business_history.init(
        {
            user_activity_id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            is_active: {
                type: DataTypes.ENUM("Y", "N"),
                allowNull: false,
            },
            createdBy: {
                type: DataTypes.STRING,
            },
            updatedBy: {
                type: DataTypes.STRING,
            },
            user_id: {
                type: DataTypes.UUID,
            },
            business_id: {
                type: DataTypes.UUID,
            },
        },
        {
            sequelize,
            modelName: business_history.name,
            tableName: "User History",
            timestamps: true,
        }
    );

    return business_history;
};