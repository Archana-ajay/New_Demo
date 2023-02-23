'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        return queryInterface.bulkInsert('user_prefrences', [
            {
                id: '06309e85-5441-4134-86d6-36f78c0031fd',
                createdAt: new Date(),
                createdBy: 'admin',
                updatedAt: new Date(),
                updatedBy: 'admin',
                pref_name: 'business_list',
                filterby:"all",
                sortOrder:"ASC",
                sortKey:"business_id",
            },
            
        ]);
    },

    async down(queryInterface) {
        return queryInterface.bulkDelete('user_prefrences', null, {});
    },
};