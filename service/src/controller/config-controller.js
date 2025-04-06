const Account = require("../model/account");
const configService = require("../service/config-service");
exports.addGlAccounts = async (req, res, next) => {
  let payload = req.body;
  let accModel = {
    balance: 0,
    due: 0,
    amountToPay: 0,
    accountType: payload.accountType,
  };
  try {
    let newAccounts = await Account.create(accModel);
    return res.status(200).json({
      message: "data added successfully",
      body: newAccounts,
    });
  } catch (error) {
    return res.status(400).json({
      message: "data added failed." + error.message,
    });
  }
};

exports.getConfig = async (req, res, next) => {
  try {
    let config = await configService.getConfig(req);
    return res.status(200).json({
      message: "data added successfully",
      body: config,
    });
  } catch (error) {
    return res.status(400).json({
      message: "data fetching Failed",
    });
  }
};

exports.addConfig = async (req, res, next) => {
  try {
    let config = await configService.addConfig(req);
    return res.status(200).json({
      message: "data added successfully",
      body: config,
    });
  } catch (error) {
    return res.status(400).json({
      message: "data fetching Failed",
    });
  }
};
exports.getRoleWiseModule = async (req, res, next) => {
  try {
    let modules = await configService.getRoleWiseModule(req);
    return res.status(200).json({
      message: "data fetched successfully",
      body: modules,
    });
  } catch (error) {
    return res.status(400).json({
      message: "data fetching Failed",
    });
  }
};
exports.adjustment = async (req, res, next) => {
  try {
    let transactionList = await configService.adjustment(req);
    return res.status(200).json({
      message: "data added successfully",
      body: transactionList,
    });
  } catch (error) {
    return res.status(400).json({
      message: "data fetching Failed",
    });
  }
};