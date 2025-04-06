const express = require('express');
const router = express.Router();
const accountController = require("../controller/account-controller");


router.get('/getgldetailsbytype',accountController.fetchInvGlAccountDetails);
router.get('/getloanlist',accountController.fetchhLoanRegistry);
router.get('/getaccountlistbycategory',accountController.fetchAllAccountByCategory);
router.get('/getloandetailsbyid',accountController.fetchhLoanDetails);
router.get('/getallgl',accountController.fetchGlDetails);
router.get('/getprofitcalculationdata',accountController.fetchProfitCalculation);

module.exports = router