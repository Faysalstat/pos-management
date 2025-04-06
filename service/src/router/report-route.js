const express = require('express');
const router = express.Router();
const reportController = require("../controller/report-controller")

router.get('/getaccounthistorybyid',reportController.getAccountHistoryByAccountId);
router.get('/getaccounthistoryrecord',reportController.getAccountHistoryRecord);
router.get('/get-sale-order-report',reportController.getSaleOrderRecord);
router.get('/get-supply-order-report',reportController.getSupplyOrderRecord);
router.get('/getstockreportrecord',reportController.getStockReport);
router.get('/getdashboardsummaryrecord',reportController.getDashboardSummary);
router.get('/getentitysummary',reportController.getEntitySummary);
router.get('/getprofitreport',reportController.getProfitReport);
router.get('/getvisualsummary',reportController.getVisualSummary)
router.get('/getstocksalereport',reportController.getStockSaleRecord)
router.get('/getstocksupplyreport',reportController.getStockSupplyRecord)
module.exports = router