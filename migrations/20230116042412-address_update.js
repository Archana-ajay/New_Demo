"use strict";

// eslint-disable-next-line no-unused-vars
const { sequelize } = require("../models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
      return Promise.all([
        await queryInterface.addColumn(
          'address', // table name
          'street_name', // new field name
          {
            type: Sequelize.STRING,
          },
        ),
        await queryInterface.removeColumn(
          'address',
          'address2',
        ),
      ]);
    },
    // eslint-disable-next-line no-unused-vars
    async down(queryInterface, Sequelize) {
      return Promise.all([
        await queryInterface.removeColumn("address","street_name"),
        await queryInterface.addColumn("address","address2"),
      ]);
    },
};