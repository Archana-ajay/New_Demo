"use strict";

// eslint-disable-next-line no-unused-vars
const { sequelize } = require("../models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("zipcode", {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.BIGINT
          },
            bt_zipcodes_id: {
                type: Sequelize.STRING,
            },
            bt_country_id: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            isactive: {
                type: Sequelize.ENUM,
                values: ["Y", "N"],
                defaultValue: "Y",
            },
            created: {
                type: Sequelize.DATE,
            },
            createdby: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            updated: {
                type: Sequelize.DATE,
            },
            updatedby: {
                type: Sequelize.STRING,
            },
            city: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            county: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            bt_region_id: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            zipcode: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        });
    },

    // eslint-disable-next-line no-unused-vars
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("zipcode");
    },
};