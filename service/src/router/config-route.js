const express = require('express');
const router = express.Router();
const configController = require("../controller/config-controller")

router.post('/addglacc',configController.addGlAccounts);
router.get('/getconfig',configController.getConfig);
router.get('/getmodules',configController.getRoleWiseModule);
router.post('/test',(req,res,next)=>{
    return res.status(200).json({
        message: "Application Running",
        body: req
      }); 
});
router.post('/addconfig',configController.addConfig);
router.post('/adjustment',configController.adjustment);

module.exports = router