"use strict";

// eslint-disable-next-line no-unused-vars
const { sequelize } = require("../models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("country", {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.BIGINT
          },
            bt_country_id: {
                type: Sequelize.STRING,
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
            short_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            sequenceno: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            is_supported: {
                type: Sequelize.ENUM,
                values: ["Y", "N"],
                defaultValue: "Y",
            },
        });
    },

    // eslint-disable-next-line no-unused-vars
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("country");
    },
};