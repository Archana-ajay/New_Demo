const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Stage_Statuses extends Model {
        // Helper method for defining associations.
        // This method is not a part of Sequelize lifecycle.
        // The `models/index` file will call this method automatically.
        static associate(model) {
            Stage_Statuses.belongsTo(model.Business, {
                foreignKey: "business_id",
            });
        }
    }

    Stage_Statuses.init(
        {
            user_id: {
                type: DataTypes.UUID,
            },
            status_id: {
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
            membership: {
                type: DataTypes.ENUM("pending", "full"),
                defaultValue: "pending",
            },
            standardc_due_diligence: {
                type: DataTypes.ENUM("pass", "fail"),
                defaultValue: "fail",
            },
            business_kyc_cdd: {
                type: DataTypes.ENUM("pass", "fail"),
                defaultValue: "fail",
            },
            business_profile: {
                type: DataTypes.ENUM("complete", "pending"),
                defaultValue: "pending",
            },
            business_id: {
                allowNull: false,
                type: DataTypes.UUID,
            },
        },
        {
            sequelize,
            modelName: Stage_Statuses.name,
            tableName: "bp_onboard_stage_status",
            timestamps: true,
        }
    );
    return Stage_Statuses;
};