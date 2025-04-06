const express = require('express');
const router = express.Router();
const clientServiceController = require('../controller/service-client-controller');

router.get('/getbyid',clientServiceController.getClientDetailsById);
router.post('/create',clientServiceController.createClient);

module.exports = router