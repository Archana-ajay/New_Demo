const express = require("express");
const app = express();
require("express-async-errors");
const db = require("./models");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const notFoundMiddleWare = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const report=require("./controller/report")

// parse requests of content-type - application/json
app.use(express.json());
//report.autoReport();

//routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);

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
