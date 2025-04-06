const express = require('express');
const router = express.Router();
const clientController = require("../controller/client-controller")

router.post('/addclient',clientController.addClient);
router.post('/updateclient',clientController.updateClient);
router.get('/getclientbycontact',clientController.getClientByContactNo);
router.get('/getclientbytype',clientController.getClientByClientType);
router.get('/getsupplyerbycode',clientController.getSupplyerByCode);
router.get('/getallclient',clientController.getAllClient);
router.get('/getcustomerbyid',clientController.getCustomerById);
router.get('/getpersonbyid',clientController.getPersonById);
router.get('/getaccounthistorybyid',clientController.getAccountHistoryByAccId);
router.get('/getclientbyid',clientController.getClientByAccId);
router.get('/getemployeebycodeorid',clientController.getEmployeeByCodeOrID);

module.exports = router