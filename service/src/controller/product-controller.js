const productService = require("../service/product-service");

exports.addProduct = async (req, res, next) => {
  let newProduct = {};
  let isUpdated = false;
  try {
    if (req.body.isEdit) {
      newProduct = await productService.updateProduct(req);
      isUpdated = true;
      return res.status(200).json({
        message: "Product Updated successfully",
        isUpdated: isUpdated,
        body: newProduct,
      });
    } else {
      newProduct = await productService.addProduct(req);
      isUpdated = false;
      return res.status(200).json({
        message: "Product Added successfully",
        isUpdated: isUpdated,
        body: newProduct,
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Operation failed." + error.message,
    });
  }
};
exports.fetchPackagingCategory = async (req, res, next) => {
  try {
    let packagingCategoryList = await productService.fetchPackagingCategory(
      req
    );
    return res.status(200).json({
      message: "data fetched successfully",
      body: packagingCategoryList,
    });
  } catch (error) {
    return res.status(400).json({
      message: "data added failed." + error.message,
    });
  }
};
exports.fetchAllProduct = async (req, res, next) => {
  try {
    let productList = await productService.fetchAllProduct(req);
    return res.status(200).json({
      message: "data fetched successfully",
      body: productList,
    });
  } catch (error) {
    return res.status(400).json({
      message: "data added failed." + error.message,
    });
  }
};
exports.fetchProductsForDropDown = async (req, res, next) => {
  try {
    let productList = await productService.fetchProductsForDropDown(req);
    return res.status(200).json({
      message: "data fetched successfully",
      body: productList,
    });
  } catch (error) {
    return res.status(400).json({
      message: "data added failed." + error.message,
    });
  }
};

exports.fetchProductById = async (req, res, next) => {
  try {
    let product = await productService.fetchProductById(req, res, next);
    
  } catch (error) {
    return res.status(400).json({
      message: "data added failed." + error.message,
    });
  }
};
exports.fetchProductByCode = async (req, res, next) => {
  try {
    let product = await productService.fetchProductByCode(req);
    if (product) {
      return res.status(200).json({
        message: "data fetched successfully",
        isExist: true,
        body: product,
      });
    } else {
      return res.status(200).json({
        message: "No Data Found",
        isExist: false,
      });
    }
  } catch (error) {
    return res.status(400).json({
      isExist: false,
      message: "data added failed." + error.message,
    });
  }
};

exports.fetchProductCategory = async (req, res, next) => {
  try {
    let productCategoryList = await productService.fetchProductCategory(req);
    return res.status(200).json({
      message: "data fetched successfully",
      body: productCategoryList,
    });
  } catch (error) {
    return res.status(400).json({
      message: "data added failed." + error.message,
    });
  }
};

exports.fetchUnitTypes = async (req, res, next) => {
  try {
    let unitTypes = await productService.fetchUnitType(req);
    return res.status(200).json({
      message: "data fetched successfully",
      body: unitTypes,
    });
  } catch (error) {
    return res.status(400).json({
      message: "data added failed." + error.message,
    });
  }
};

exports.addProductCategory = async (req, res, next) => {
  try {
    let productCategory = await productService.addProductCategory(req);
    return res.status(200).json({
      message: "Product category Added successfully",
      body: productCategory,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Operation failed." + error.message,
    });
  }
};

exports.addPackagingCategory = async (req, res, next) => {
  try {
    let packagingCategory = await productService.addPackagingCategory(req);
    return res.status(200).json({
      message: "Product category Added successfully",
      body: packagingCategory,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Operation failed." + error.message,
    });
  }
};
exports.deleteProductCategory = async (req, res, next) => {
  try {
    let deletedStatus = await productService.deleteProductCategory(req);
    return res.status(200).json({
      message: deletedStatus,
      isSuccess: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Operation failed." + error.message,
      isSuccess: false,
    });
  }
};

exports.addUnitType = async (req, res, next) => {
  try {
    let productCategory = await productService.addUnitType(req);
    return res.status(200).json({
      message: "Product category Added successfully",
      body: productCategory,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Operation failed." + error.message,
    });
  }
};

exports.deletePackagingCategory = async (req, res, next) => {
  try {
    let deletedStatus = await productService.deletePackagingCategory(req);
    return res.status(200).json({
      message: deletedStatus,
      isSuccess: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Operation failed." + error.message,
      isSuccess: false,
    });
  }
};

exports.deleteUnitType = async (req, res, next) => {
  try {
    let deletedStatus = await productService.deleteUnitType(req);
    return res.status(200).json({
      message: deletedStatus,
      isSuccess: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Operation failed." + error.message,
      isSuccess: false,
    });
  }
};
exports.addBrandName = async (req, res, next) => {
  try {
    let brandName = await productService.addBrandName(req);
    return res.status(200).json({
      message: "Product Brand Name Added successfully",
      body: brandName,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Operation failed." + error.message,
    });
  }
};

exports.deleteBrandName = async (req, res, next) => {
  try {
    let deletedBrandName = await productService.deleteBrandName(req);
    return res.status(200).json({
      message: deletedBrandName,
      isSuccess: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Operation failed." + error.message,
      isSuccess: false,
    });
  }
};


exports.fetchAllBrandName = async (req, res, next) => {
  try {
    let brandNameList = await productService.fetchAllBrandName(req);
    return res.status(200).json({
      message: "data fetched successfully",
      body: brandNameList,
    });
  } catch (error) {
    return res.status(400).json({
      message: "data added failed." + error.message,
    });
  }
};
