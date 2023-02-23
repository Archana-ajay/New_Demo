const express = require("express");
const validationMiddleware = require("../middleware/joi-validator");
const {
    getCountryList,
    getZipcodeList,
    getphoneTypeList,
    getlicenseTypeList,
    getregionTypeList,
    getinvestorTypeList,
    getlicenseTypedesignList,
    getAllBusiness,
    registerBusiness,
    oneBusiness,
    viewBusiness,
    editBusiness,
    adduser,
    edituser,
    deleteUser,
    businessHistoryCsv,
    businessHistoryPdf,
} = require("../controller/businessContoller");
const router = express.Router();
const authenticate = require("../middleware/authenticate");

router.get(
    "/getonebusiness/:id",
    validationMiddleware.getOneParamsSchema,
    oneBusiness
);
router.get(
    "/getallbusiness",
    validationMiddleware.querySchemaBusinessList,
    getAllBusiness
);
router.post("/exportcsv/:id", businessHistoryCsv);
router.post("/exportpdf/:id", businessHistoryPdf);
router.use(authenticate);

router.post("/adduserbusiness/:id", adduser);
router.patch("/edituser/:id", edituser);
router.delete("/deleteuser", deleteUser);
router.get("/getalllicensetype", getlicenseTypedesignList);
router.get("/getallCountries", getCountryList);
router.get("/getallzipcode", getZipcodeList);
router.get("/getallphonetype", getphoneTypeList);
router.get("/getalllicensetype", getlicenseTypeList);
router.get("/getallregion", getregionTypeList);
router.get("/getallinvestortype", getinvestorTypeList);
router.post(
    "/registerbusiness",
    validationMiddleware.cannabisBusiness,
    registerBusiness
);
router.get("/viewbusiness", viewBusiness);
router.patch(
    "/editbusiness/:id",
    validationMiddleware.updateBusiness,
    editBusiness
);
module.exports = router;