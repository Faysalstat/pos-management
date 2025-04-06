const Account = require("../model/account");
const Assets = require("../model/assets");
const { ACCOUNT_TYPES, TransactionTypes, GL_TYPES } = require("../model/enums");
const GlAccount = require("../model/glAccounts");
const db = require("../connector/db-connector");
const transactionRepo = require("../repository/transactionRepository");
exports.addAsset = async (req) => {
  let payload = req.body;
  let tnxDate = new Date();
  let voucherNo = tnxDate.getTime();
  let buyingPrice = Number(payload.buyingPrice);
  let presentValue = Number(payload.presentValue);
  let debitAmount = 0;
  let creditAmount = 0;
  let clientId;
  if (payload.clientId && payload.clientId != "") {
    clientId = payload.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  let assetAcc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.ASSET_GL,clientId:clientId },
    include: GlAccount,
  });
  let cashInHandAcc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.CASH_GL,clientId:clientId },
    include: GlAccount,
  });
  let assetTnxModel;
  let cashInHandTnxModel;
  let assetModel = {
    assetName: payload.assetName,
    purchaseDate: payload.purchaseDate,
    buyingPrice: buyingPrice,
    presentValue: presentValue,
    quantity: payload.quantity,
    discription: payload.discription,
    status: "ACTIVE",
    clientId: clientId,
  };
  try {
    const result = await db.sequelize.transaction(async (t) => {
      let asset = await Assets.create(assetModel, { transaction: t });
      assetTnxModel = {
        transactionType: TransactionTypes.DEBIT,
        transactionReason: "ASSET_PURCHASE",
        transactionCategory: "ASSET_PURCHASE",
        amount: buyingPrice,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: "Internal_Transaction",
        refference: payload.discription,
        accountNo: assetAcc.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.ASSET_GL,
        isDebit: true,
        isIncrease: true,
        clientId: clientId,
        transaction:t
      };
      debitAmount += buyingPrice;
      cashInHandTnxModel = {
        transactionType: TransactionTypes.CREDIT,
        transactionReason: "ASSET_PURCHASE",
        transactionCategory: "ASSET_PURCHASE",
        amount: buyingPrice,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: "Internal_Transaction",
        refference: payload.discription,
        accountNo: cashInHandAcc.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.ASSET_GL,
        isDebit: false,
        isIncrease: false,
        clientId: clientId,
        transaction:t
      };
      creditAmount += buyingPrice;
      let assetTnx = await transactionRepo.doTransaction(assetTnxModel);
      let cashInHandTnx = await transactionRepo.doTransaction(
        cashInHandTnxModel
      );

      let updatedAssetAccBalance = assetAcc.balance + payload.presentValue;
      let updatedCashAccBalance = cashInHandAcc.balance - payload.presentValue;
    });
    if (debitAmount != creditAmount) {
      throw new Error("Debit and Credit are not Same");
    }
    return "Successfull";
  } catch (error) {
    throw new Error(error.message);
  }
};
exports.updateAsset = async (req) => {
  let payload = req.body;
  let assetModel = {
    assetName: payload.assetName,
    purchaseDate: payload.purchaseDate,
    buyingPrice: payload.buyingPrice,
    presentValue: payload.presentValue,
    quantity: payload.quantity,
    discription: payload.discription,
    status: payload.status,
    
  };

  try {
    const result = await db.sequelize.transaction(async (t) => {
      let updatedAsset = await Assets.update(assetModel, {
        where: { id: payload.assetId,clientId: clientId},
      });
    });

    return "Successfull";
  } catch (error) {
    return res.status(400).json({
      message: "Operation Failed" + error.message,
      isSuccess: false,
    });
  }
};
exports.deleteAssetByID = async (req, res, next) => {
  try {
    return "Successfull";
  } catch (error) {
    return res.status(400).json({
      message: "Operation Failed" + error.message,
      isSuccess: false,
    });
  }
};
exports.getAllAssets = async (req, res, next) => {
  try {
    let params = req.query;
    let clientId;
    if (params.clientId && params.clientId != "") {
      clientId = params.clientId;
    } else {
      throw new Error("Client ID not provided");
    }
    let assetList = await Assets.findAll({where:{clientId:clientId}});
    return assetList;
  } catch (error) {
    return res.status(400).json({
      message: "Operation Failed" + error.message,
      isSuccess: false,
    });
  }
};
