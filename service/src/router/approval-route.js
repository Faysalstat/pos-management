const express = require('express');
const router = express.Router();
const approvalController = require("../controller/approval-controller");


router.post('/add',approvalController.sendToApproval);
router.get('/getbyid',approvalController.getApprovalById);
router.get('/getall',approvalController.getApprovalList);
router.post('/decline',approvalController.rejectApproval);

module.exports = router