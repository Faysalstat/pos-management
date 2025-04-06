const { Op } = require("sequelize");
const Account = require("../model/account");
const AccountHistory = require("../model/accountHistory");
const { GL_TYPES, ACCOUNT_TYPES } = require("../model/enums");
const GlAccount = require("../model/glAccounts");
const LoanAccount = require("../model/loanAcc");
const LoanClient = require("../model/loanClient");

exports.fetchInvGlAccountDetails = async (req) => {
  let params = req.query;
  let glType = GL_TYPES.INVENTORY_GL;
  let clientId;
  if (params.glType && params.glType != "") {
    glType = params.glType;
  }

  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    let inventoryAcc = await Account.findOne({
      where: { accountType: glType, clientId: clientId },
    });

    return inventoryAcc;
  } catch (error) {
    throw new Error("Approval Creation Failed");
  }
};

exports.fetchhLoanRegistry = async (req) => {
  let params = req.query;
  let loanRegistry = [];
  let clientId;
  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    loanRegistry = await LoanAccount.findAll({
      where: { clientId: clientId },
      include: [LoanClient, Account],
    });
    return loanRegistry;
  } catch (error) {
    throw new Error("Account Details Fetching Failed");
  }
};

exports.fetchhLoanDetails = async (req) => {
  let params = req.query;
  let loanDetails = {};
  let clientId;
  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    loanDetails = await LoanAccount.findOne({
      where: { id: params.loanAccountId, clientId: clientId },
      include: [LoanClient, { model: Account, include: AccountHistory }],
    });
    return loanDetails;
  } catch (error) {
    throw new Error("Account Details Fetching Failed");
  }
};

exports.fetchAllAccountByCategory = async (req) => {
  let params = req.query;
  let accountList = [];
  let category = "";
  let clientId;
  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  if (params.category || params.category != "") {
    category = params.category;
  }
  try {
    accountList = await Account.findAll({
      where: { category: category, clientId: clientId },
    });
    return accountList;
  } catch (error) {
    throw new Error("Account List Fetching Failed");
  }
};

exports.fetchGlDetails = async (req) => {
  let params = req.query;
  let parentGLList = [];
  let childGLList = [];
  let clientId;
  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    parentGLList = await GlAccount.findAll({where:{clientId:clientId}});
    childGLList = await Account.findAll({
      where: { category: "GL", clientId: clientId },
    });

    return {
      parentGLList: parentGLList,
      childGLList: childGLList,
    };
  } catch (error) {
    throw new Error("Account Details Fetching Failed");
  }
};

exports.fetchProfitCalcuationData = async (req) => {
  let query = {};
  let params = req.query;
  let clientId;
  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  let incomeGL = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.INCOME_GL, clientId: clientId },
  });
  let expenseGl = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.EXPENSE_GL, clientId: clientId },
  });
  let extraChargeGl = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.EXTRA_CHARGE_GL, clientId: clientId },
  });
  let incomeAccountHistories = [];
  let expenseAccountHistories = [];
  let extraChargeAccountHistories = [];
  let fromDate = new Date("2023-01-01");
  let toDate = new Date();
  toDate.setDate(toDate.getDate() + 1);
  if (params.fromDate || params.fromDate != "") {
    fromDate = new Date(params.fromDate);
  }
  if (params.toDate || params.toDate != "") {
    toDate = new Date(params.toDate);
  }
  query.tnxDate = { [Op.between]: [fromDate, toDate] };
  try {
    incomeAccountHistories = await AccountHistory.findAll({
      where: {
        accountId: incomeGL.id,
        clientId: clientId,
        tnxDate: { [Op.between]: [fromDate, toDate] },
      },
    });
    expenseAccountHistories = await AccountHistory.findAll({
      where: {
        accountId: expenseGl.id,
        clientId: clientId,
        tnxDate: { [Op.between]: [fromDate, toDate] },
      },
    });
    extraChargeAccountHistories = await AccountHistory.findAll({
      where: {
        accountId: extraChargeGl.id,
        clientId: clientId,
        tnxDate: { [Op.between]: [fromDate, toDate] },
      },
    });
    return {
      incomeAccountHistories: incomeAccountHistories,
      expenseAccountHistories: expenseAccountHistories,
      extraChargeAccountHistories: extraChargeAccountHistories,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
