"use strict";
const fs = require("fs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    // eslint-disable-next-line no-unused-vars
    async up(queryInterface, Sequelize) {
        const add = fs.readFileSync("bp_user_association.json", "utf-8");
        // eslint-disable-next-line no-var
        var myObject = JSON.parse(add);
        await queryInterface.bulkInsert("userassociation", myObject);
    },

    // eslint-disable-next-line no-unused-vars
    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("userassociation", null, {});
    },
};