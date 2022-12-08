const express = require("express");
const app = express();
require('dotenv').config();
require("express-async-errors");
const db = require("./models");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const fileUpload = require('express-fileupload');
const notFoundMiddleWare = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const authentication=require('./middleware/middleware')
const {generateAccessToken1}=require('./utils/jwt')
const report=require("./controller/report")
const remainder=require("./utils/remainder")
const bucket=require('./utils/S3helper')
// var bodyParser = require('body-parser')

// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({extended: true}));

// parse requests of content-type - application/json
app.use(express.json());
//report.autoReport();
remainder.reminder()

//routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin",adminRouter);

//middleware
app.use(notFoundMiddleWare);
app.use(errorHandlerMiddleware);

db.sequelize
    .sync()
    .then(() => {
        console.log("synced db");
    })
    .catch((err) => {
        console.log("failed" + err.message);
    });

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`server is listening on ${port}...`);
});
