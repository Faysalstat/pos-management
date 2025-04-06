const express = require('express');
const router = express.Router();
const authController = require("../controller/auth-controller")

router.post('/login',authController.login);
router.post('/adduser',authController.addUser);
router.post('/signout',authController.signout);
router.get('/checkexistinguser',authController.checkExistingUser);
router.get('/islogedin',authController.isLoggedIn);
router.get('/getalluser',authController.getAllUser);

module.exports = router