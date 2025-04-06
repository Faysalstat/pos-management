const express = require('express');
const router = express.Router();
const saleController = require("../controller/sale-controller")

router.post('/issueorder',saleController.issueSaleOrders);
router.post('/cancelorder',saleController.cancelSaleOrder);
router.post('/dopayment',saleController.doPayment);
router.get('/getallinvoice',saleController.getSaleOrderList);
router.get('/getinvoicebyid',saleController.getSaleOrderById);
router.post('/updateinvoice',saleController.updateSaleOrder);
router.post('/dosaleorderreturn',saleController.doSaleOrderReturn);
router.post('/dosupplyorderreturn',saleController.doSupplyOrderReturn);
module.exports = router