"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("region", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            bt_region_id: {
                type: Sequelize.STRING,
            },
            isactive: {
                type: Sequelize.STRING,
            },
            name: {
                type: Sequelize.STRING,
            },
            created: {
                type: Sequelize.DATE,
            },
            createdby: {
                type: Sequelize.STRING,
            },
            updated: {
                type: Sequelize.DATE,
            },
            updatedby: {
                type: Sequelize.STRING,
            },
            bt_country_id: {
                type: Sequelize.STRING,
            },
            short_name: {
                type: Sequelize.STRING,
            },
            sequenceno: {
                type: Sequelize.INTEGER,
            },
            is_supported: {
                type: Sequelize.STRING,
            },
            is_license_internal_search: {
                type: Sequelize.STRING,
            },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable("region");
    },
};