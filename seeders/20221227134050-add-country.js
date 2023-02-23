"use strict";
const fs = require("fs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    // eslint-disable-next-line no-unused-vars
    async up(queryInterface, Sequelize) {
        const add = fs.readFileSync("bt_country.json", "utf-8");
        // eslint-disable-next-line no-var
        var myObject = JSON.parse(add);
        await queryInterface.bulkInsert("country", myObject);
    },

    // eslint-disable-next-line no-unused-vars
    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("country", null, {});
    },
};