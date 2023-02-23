const express = require("express");
const app = express();
require("express-async-errors");
const db = require("./models");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const businessRouter = require("./routes/business");
const notFoundMiddleWare = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
//const report = require("./controller/reportController");
const fileUpload = require("express-fileupload");
const authenticationMiddleWare = require("./middleware/middleware");
//const { generateAccessToken } = require("./utills/jwt");
const { generateAccessToken1 } = require("./utils/jwt");
//const remainder = require("./utills/remainder");
app.use(fileUpload({ useTempFiles: false }));
// parse requests of content-type - application/json
app.use(express.json());
//report.Report();
//remainder.reminder();
const a = generateAccessToken1(
    process.env.USE,
    process.env.PASS
);
console.log(a);
//routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", authenticationMiddleWare, adminRouter);
app.use("/api/v1/business", businessRouter);

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