const express = require('express');
const router = express.Router();
const productController = require("../controller/product-controller")

router.post('/addproduct',productController.addProduct);
router.post('/addproductcategory',productController.addProductCategory);
router.post('/addpackagingcategory',productController.addPackagingCategory);
router.post('/addunittype',productController.addUnitType);
router.post('/addbrandname',productController.addBrandName);
router.get('/getallproduct',productController.fetchAllProduct);
router.get('/getallpackagingcategory',productController.fetchPackagingCategory);
router.get('/getallproductcategory',productController.fetchProductCategory);
router.get('/getallunittype',productController.fetchUnitTypes);
router.get('/getallproductfordropdown',productController.fetchProductsForDropDown);
router.get('/getproductbyid',productController.fetchProductById);
router.get('/getproductbycode',productController.fetchProductByCode);
router.get('/getallbrandname',productController.fetchAllBrandName);
router.post('/delete-product-category',productController.deleteProductCategory);
router.post('/delete-packaging-category',productController.deletePackagingCategory);
router.post('/delete-unit-type',productController.deleteUnitType);
router.post('/deletebrandname',productController.deleteBrandName);

module.exports = router