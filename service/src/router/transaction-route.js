const express = require('express');
const router = express.Router();
const transactionController = require("../controller/transaction-controller");


router.get('/gettransactionreport',transactionController.getTransactionReport);
router.post('/dotransaction',transactionController.doTransactionPayment);
router.post('/doexpense',transactionController.doExpenseTransaction);
router.post('/dodeposit',transactionController.doExpenseTransaction);
router.get('/fetchtransactionreason',transactionController.fetchTransactionReasons);
router.post('/addreason',transactionController.addTransactionReason);
router.post('/deletereason',transactionController.deleteTnxReason);
router.post('/paysalary',transactionController.doSalaryPaymentTransaction);
router.post('/payinstallment',transactionController.payInstallment);
module.exports = router