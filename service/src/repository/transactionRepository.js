const Account = require("../model/account");
const GlAccount = require("../model/glAccounts");
const TransactionRegistry = require("../model/transactionRegistry");
const db = require("../connector/db-connector");
const AccountHistory = require("../model/accountHistory");

exports.doTransaction = async (transactionModel) => {
  let tnxAmount = +Number(transactionModel.amount).toFixed(2);
  
  let transactionObj = await mapTransactionModel(transactionModel);
  let updatedAccBalance = 0;
  let updatedGLBalance = 0;
  try {
    let account = await Account.findOne({
      where: { id: transactionModel.accountNo,clientId:transactionObj.clientId},
      include: GlAccount,
    });
      let accountHistoryModel = {
        tnxDate: transactionModel.transactionDate,
        tnxType: transactionModel.isDebit ? "DEBIT" : "CREDIT",
        tnxAmount: tnxAmount,
        paymentMethod: transactionModel.paymentMethod,
        remark: transactionModel.refference,
        accountId: account.id,
        previousBalance: account.balance,
        voucherNo:transactionModel.voucherNo,
        clientId:transactionObj.clientId
      };
      if (transactionModel.isIncrease) {
        updatedAccBalance = +Number(account.balance + tnxAmount);
        updatedGLBalance = +Number(account.glAccount.balance + tnxAmount).toFixed(2);
      } else {
        updatedAccBalance = +Number(account.balance - tnxAmount).toFixed(2);
        updatedGLBalance = +Number(account.glAccount.balance - tnxAmount).toFixed(2);
      }
      let updatedAcc = await Account.update(
        { balance: updatedAccBalance },
        { where: { id: account.id } }
      );
      let updatedGLAcc = await GlAccount.update(
        { balance: updatedGLBalance },
        { where: { id: account.glAccount.id } }
      );
      let accountHistory = await AccountHistory.create(accountHistoryModel);
      let transaction = await TransactionRegistry.create(transactionObj);

    return {
      isSuccess: true,
      isDebit: transactionModel.isDebit,
    };
  } catch (error) {
    throw new Error("Transaction Failed " + error.message);
  }
};
exports.doBulkTransaction = async (transactionModels) => {
  try {
    const result = await db.sequelize.transaction(async (t) => {
      transactionModels.forEach(async (transactionModel) => {
        let tnxAmount = transactionModel.amount;
        let transactionObj = await mapTransactionModel(transactionModel);
        let accountHistoryModel = {
          tnxDate: transactionModel.transactionDate,
          tnxType: transactionModel.isDebit ? "DEBIT" : "CREDIT",
          tnxAmount: tnxAmount,
          paymentMethod: transactionModel.paymentMethod,
          remark: transactionModel.refference,
          accountId: transactionModel.accountNo,
        };
        let accountHistory = await AccountHistory.create(accountHistoryModel, {
          transaction: t,
        });
        let transaction = await TransactionRegistry.create(transactionObj, {
          transaction: t,
        });
      });
    });
    return {
      isSuccess: true,
    };
  } catch (error) {
    throw new Error("Transaction Failed " + error.message);
  }
};
async function mapTransactionModel(model) {
  let transactionModel = {
    clientId: model.clientId,
    transactionType: model.transactionType,
    transactionReason: model.transactionReason,
    transactionCategory: model.transactionCategory,
    amount: +(Number(Math.abs(model.amount)).toFixed(2)) || 0,
    paymentMethod: model.paymentMethod,
    transactionDate: model.transactionDate,
    approvedBy: model.approvedBy,
    issuedBy: model.issuedBy,
    accountNo: model.accountNo,
    voucherNo: model.voucherNo,
    refference: model.refference,
    isDebit: model.isDebit ? 1 : 0,
    GL_TYPE: model.GL_TYPE,
    isIncrease: model.isIncrease ? true : false,
    payingTo: model.payingTo || "",
  };
  return transactionModel;
}
