const assetsService = require("../service/assets-service");
exports.addAsset = async (req, res, next) => {
  try {
    let response = await assetsService.addAsset(req);
    return res.status(200).json({
      body: response,
      isSuccess: true,
      message: "Operation Successfull",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Operation Failed" + error.message,
      isSuccess: false,
    });
  }
};
exports.updateAsset = async (req, res, next) => {
  try {
    let response = await assetsService.updateAsset(req);
    return res.status(200).json({
      body: response,
      isSuccess: true,
      message: "Operation Successfull",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Operation Failed" + error.message,
      isSuccess: false,
    });
  }
};
exports.deleteAssetByID = async (req, res, next) => {
  try {
    let response = await assetsService.deleteAssetByID(req);
    return res.status(200).json({
      body: response,
      isSuccess: true,
      message: "Operation Successfull",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Operation Failed" + error.message,
      isSuccess: false,
    });
  }
};
exports.getAllAssets = async (req, res, next) => {
  try {
    let response = await assetsService.getAllAssets(req);
    return res.status(200).json({
      body: response,
      isSuccess: true,
      message: "Operation Successfull",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Operation Failed" + error.message,
      isSuccess: false,
    });
  }
};
