// eslint-disable-next-line no-unused-vars
const { Model, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class User_Association extends Model {
        // Helper method for defining associations.
        // This method is not a part of Sequelize lifecycle.
        // The `models/index` file will call this method automatically.
        static associate(model) {
            User_Association.belongsTo(model.Business, {
                foreignKey: "business_id",
            });
        }
    }
    User_Association.init(
        {
            business_user_assoc_id: {
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
            description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            user_assoc_role: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            user_id: {
                allowNull: false,
                type: DataTypes.UUID,
            },
            business_id: {
                allowNull: false,
                type: DataTypes.UUID,
            },
            investor_type_id: {
                type: DataTypes.INTEGER,
            },
            user_assoc_id: {
                allowNull: false,
                type: DataTypes.BIGINT,
            },

            is_contact_person: {
                type: DataTypes.STRING,
                defaultValue: "N",
            },
            ownership_percent: {
                type: DataTypes.BIGINT,
            },
            name: {
                type: DataTypes.STRING,
            },
            email: {
                type: DataTypes.STRING,
            },
        },
        {
            sequelize,
            modelName: User_Association.name,
            tableName: "user_association",
            timestamps: true,
        }
    );

    return User_Association;
};