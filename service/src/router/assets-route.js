const express = require('express');
const router = express.Router();
const assetController = require("../controller/assets-controller");

router.post('/addassets',assetController.addAsset);
router.post('/updateassets',assetController.updateAsset);
router.post('/deleteassetbyid',assetController.deleteAssetByID);
router.get('/getall',assetController.getAllAssets);
module.exports = router