const { Op } = require("sequelize");
const BrandName = require("../model/brandName");
const PackagingCategory = require("../model/packagingCategory");
const Product = require("../model/product");
const ProductCategory = require("../model/productCategory");
const UnitType = require("../model/unitType");
const bwipjs = require("bwip-js");
exports.addProduct = async (req) => {
  let payload = req.body;
  let clientId;
  if (payload.clientId && payload.clientId != "") {
    clientId = payload.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  let productModel = {
    productCode: payload.productCode,
    productName: payload.productName,
    unitType: payload.unitType,
    quantity: 0,
    quantitySold: 0,
    quantityReturn: 0,
    quantityDamaged: 0,
    costPricePerUnit: payload.costPricePerUnit,
    sellingPricePerUnit: payload.sellingPricePerUnit,
    brandName: payload.brandName,
    packagingCategory: payload.packagingCategory,
    productCategory: payload.productCategory,
    unitPerPackage: payload.unitPerPackage,
    clientId: clientId,
  };
  try {
    let newProduct = await Product.create(productModel);
    return newProduct;
  } catch (error) {
    throw new Error("Product add failed! ERROR: " + error);
  }
};
exports.fetchAllProduct = async (req) => {
  let params = req.query;
  let query = {};
  let offset = Number(req.query.offset);
  let limit = Number(req.query.limit);
  if (params.brandName && params.brandName != "") {
    query.brandName = params.brandName;
  }
  if (params.categoryName && params.categoryName != "") {
    query.productCategory = params.categoryName;
  }
  if (params.code && params.code != "") {
    query.productCode = params.code;
  }
  if (params.clientId && params.clientId != "") {
    query.clientId = params.clientId;
  }
  if (params.clientId && params.clientId != "") {
    query.clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    let productList = await Product.findAll({
      offset: offset,
      limit: limit,
      where: query,
    });
    return productList;
  } catch (error) {
    throw new Error(error);
  }
};
exports.fetchPackagingCategory = async (req) => {
  let params = req.query;
  let clientId;
  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    let packagingCategoryList = await PackagingCategory.findAll({
      where: { clientId: clientId },
    });
    return packagingCategoryList;
  } catch (error) {
    throw new Error(error);
  }
};
exports.fetchProductsForDropDown = async (req) => {
  let query = req.query;
  let clientId;
  if (query.clientId && query.clientId != "") {
    clientId = query.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    let productList = await Product.findAll({ where: { clientId: clientId } });
    return productList;
  } catch (error) {
    throw new Error(error);
  }
};
exports.fetchProductById = async (req, res, next) => {
  let query = req.query;

  try {
    let product = await Product.findOne({ where: { id: query.id } });
    const barcodeOptions = {
      bcid: "code39", // Barcode type
      text: product.productCode || "123456789", // Barcode value (default: 123456789)
      scale: 3, // Scale factor
      height: 3, // Bar height, in millimeters
      includetext: false, // Show human-readable text
      textxalign: "center", // Text alignment
    };
    bwipjs.toBuffer(barcodeOptions, async function (err, png) {
      if (err) {
        return res.status(500).json({
          message: "Error generating barcode"
        });
      } else {
        return res.status(200).json({
          message: "data fetched successfully",
          body: {
            product: product,
            barcode: png.toString("base64"),
          },
        });
      }
    });
  } catch (error) {
    throw new Error(error);
  }
};

exports.fetchProductByCode = async (req) => {
  let query = {};
  if (req.query.code && req.query.code != "") {
    query.productCode = req.query.code;
  }
  if (req.query.name && req.query.name != "") {
    query.productName = req.query.name;
  }
  if (req.query.clientId && req.query.clientId != "") {
    query.clientId = req.query.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    let product = await Product.findOne({ where: query });
    return product;
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateProduct = async (req) => {
  let payload = req.body;
  let productModel = {
    productName: payload.productName,
    unitType: payload.unitType,
    costPricePerUnit: payload.costPricePerUnit,
    sellingPricePerUnit: payload.sellingPricePerUnit,
    brandName: payload.brandName,
    packagingCategory: payload.packagingCategory,
    productCategory: payload.productCategory,
    unitPerPackage: payload.unitPerPackage,
  };
  let clientId;
  if (payload.clientId && payload.clientId != "") {
    clientId = payload.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    let updatedProduct = await Product.update(productModel, {
      where: { id: payload.id, clientId: clientId },
    });
    let product = await Product.findOne({ where: { id: payload.id } });
    return product;
  } catch (error) {
    throw new Error("Product Update failed! ERROR: " + error);
  }
};

exports.deleteProductCategory = async (req) => {
  let params = req.body;
  try {
    let deletedItem = await ProductCategory.destroy({
      where: { id: params.categoryId },
    });
    return "Success";
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.deletePackagingCategory = async (req) => {
  let params = req.body;
  try {
    let deletedItem = await PackagingCategory.destroy({
      where: { id: params.categoryId },
    });
    return "Success";
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.deleteUnitType = async (req) => {
  let params = req.body;
  try {
    let deletedItem = await UnitType.destroy({ where: { id: params.unitId } });
    return "Success";
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.fetchProductCategory = async (req) => {
  let query = req.query;
  if (!query.clientId && query.clientId == "") {
    throw new Error("Client ID not provided");
  }
  try {
    let productCategoryList = await ProductCategory.findAll({
      where: { clientId: query.clientId },
    });
    return productCategoryList;
  } catch (error) {
    throw new Error(error);
  }
};

exports.fetchUnitType = async (req) => {
  let query = req.query;
  if (!query.clientId && query.clientId == "") {
    throw new Error("Client ID not provided");
  }
  try {
    let UnitTypeList = await UnitType.findAll({
      where: { clientId: query.clientId },
    });
    return UnitTypeList;
  } catch (error) {
    throw new Error(error);
  }
};

exports.addProductCategory = async (req) => {
  let payload = req.body;
  if (!payload.clientId || payload.clientId == "") {
    throw new Error("Client ID not provided");
  }
  let categoryModel = {
    key: payload.key,
    value: payload.value,
    clientId: payload.clientId,
  };
  try {
    let newProductCategory = await ProductCategory.create(categoryModel);
    return newProductCategory;
  } catch (error) {
    throw new Error("Product  Category add failed! ERROR: " + error);
  }
};
exports.addPackagingCategory = async (req) => {
  let payload = req.body;
  if (!payload.clientId || payload.clientId == "") {
    throw new Error("Client ID not provided");
  }
  let categoryModel = {
    key: payload.key,
    value: payload.value,
    clientId: payload.clientId,
  };
  try {
    let newPackagingCategory = await PackagingCategory.create(categoryModel);
    return newPackagingCategory;
  } catch (error) {
    throw new Error("Packaging  Category add failed! ERROR: " + error);
  }
};
exports.addUnitType = async (req) => {
  let payload = req.body;
  if (!payload.clientId || payload.clientId == "") {
    throw new Error("Client ID not provided");
  }
  let model = {
    key: payload.key,
    value: payload.value,
    clientId: payload.clientId,
  };
  try {
    let newUnitType = await UnitType.create(model);
    return newUnitType;
  } catch (error) {
    throw new Error("Product  Category add failed! ERROR: " + error);
  }
};

exports.addBrandName = async (req) => {
  let payload = req.body;
  let model = {
    key: payload.key,
    value: payload.value,
    clientId: payload.clientId,
  };
  try {
    let newBrandName = await BrandName.create(model);
    return newBrandName;
  } catch (error) {
    throw new Error("Product  Brand Name add failed! ERROR: " + error);
  }
};
exports.deleteBrandName = async (req) => {
  let params = req.body;

  try {
    let deletedItem = await BrandName.destroy({
      where: { id: params.brandId },
    });
    return "Success";
  } catch (error) {
    throw new Error(error.message);
  }
};
exports.fetchAllBrandName = async (req) => {
  let params = req.query;
  if (!params.clientId && params.clientId == "") {
    throw new Error("Client ID not provided");
  }
  try {
    let brandNameList = await BrandName.findAll({
      where: { clientId: params.clientId },
    });
    return brandNameList;
  } catch (error) {
    throw new Error(error);
  }
};
