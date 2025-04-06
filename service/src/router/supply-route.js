const express = require('express');
const router = express.Router();
const supplyController = require("../controller/supply-controller")

router.post('/issuesupplyorder',supplyController.issueSupplyOrder);
router.post('/updateinvoice',supplyController.updateSupplyOrder);
router.post('/dodelievery',supplyController.doDelievary);
router.get('/getallinvoice',supplyController.getSupplyOrderList);
router.get('/getinvoicebyid',supplyController.getSupplyOrderById);
module.exports = router