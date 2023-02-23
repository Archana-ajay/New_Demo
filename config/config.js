require('dotenv').config();
module.exports = {
    local: {
        username: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DB,
        host: process.env.HOST,
        dialect: 'postgres',
    },
    development: {
        username: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DB,
        host: process.env.HOST,
        dialect: 'postgres',
    },
    test: {
        username: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DB,
        host: process.env.HOST,
        dialect: 'postgres',
    },
    production: {
        username: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DB,
        host: process.env.HOST,
        dialect: 'postgres',
    },
};
