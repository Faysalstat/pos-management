const TransactionRegistry = require("../model/transactionRegistry");
const db = require("../connector/db-connector");
const Account = require("../model/account");
const {
  GL_TYPES,
  TransactionTypes,
  ACCOUNT_TYPES,
  TRANSACTION_CATEGORY,
} = require("../model/enums");
const AccountHistory = require("../model/accountHistory");
const Customer = require("../model/customer");
const Person = require("../model/person");
const Supplyer = require("../model/supplyer");
const { Op } = require("sequelize");
const TransactionReason = require("../model/transactionReason");
const ApprovalFlow = require("../model/approvalflow");
const Employee = require("../model/employee");
const transactionRepo = require("../repository/transactionRepository");
const GlAccount = require("../model/glAccounts");
const LoanClient = require("../model/loanClient");
const LoanAccount = require("../model/loanAcc");
exports.getTreansactionReport = async (req) => {
  let params = req.query;
  let query = {};
  let transactionList = [];
  let fromDate = new Date("2023-01-01");
  let toDate = new Date();
  let offsets = Number(req.query.offset);
  let limit = Number(req.query.limit);
  let length = 0;
  toDate.setDate(toDate.getDate() + 1);
  if (params.clientId && params.clientId != "") {
    query.clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  if (req.query.voucherNo || req.query.voucherNo != "") {
    query.voucherNo = req.query.voucherNo;
  }
  if (req.query.transactionCategory || req.query.transactionCategory != "") {
    query.transactionCategory = req.query.transactionCategory;
  }
  if (req.query.tnxType || req.query.tnxType != "") {
    if (req.query.tnxType == "CREDIT") {
      query.transactionType = req.query.tnxType;
    } else if (req.query.tnxType == "DEBIT") {
      query.transactionType = req.query.tnxType;
    }
  }
  if (req.query.fromDate || req.query.fromDate != "") {
    fromDate = new Date(req.query.fromDate);
  }
  if (req.query.toDate || req.query.toDate != "") {
    toDate = new Date(req.query.toDate);
  }
  query.transactionDate = { [Op.between]: [fromDate, toDate] };
  try {
    transactionList = await TransactionRegistry.findAll({
      offset: offsets,
      limit: limit,
      where: query,
      include: Account,
    });
    length = await TransactionRegistry.count({ where: query });
    return {
      data: transactionList,
      size: length,
    };
  } catch (error) {
    throw new Error(error);
  }
};

exports.doTransactionPayment = async (req) => {
  let payload = req.body;
  let today = new Date();
  let tnxDate = payload.tnxDate;
  let voucherNo = today.getTime();
  let debitTransactionModel = {};
  let creditTransactionModel = {};
  let debitAmount = 0;
  let creditAmount = 0;
  let clientId;
  if (payload.clientId && payload.clientId != "") {
    clientId = payload.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    let tnxAmount = Number(payload.cashAmount);

    let clientAcc = await Account.findOne({
      where: { id: payload.accountId },
    });
    let cashGl = await Account.findOne({
      where: { accountType: ACCOUNT_TYPES.CASH_GL, clientId: clientId },
    });

    const result = await db.sequelize.transaction(async (t) => {
      if (payload.clientType == "CUSTOMER") {
        if (payload.isReturn) {
          // Debit Transaction in Liability Acc
          debitTransactionModel = {
            transactionType: TransactionTypes.DEBIT,
            transactionReason: "RETURN_TO_CUSTOMER",
            transactionCategory: "CASH_TRANSACTION",
            amount: tnxAmount,
            transactionDate: tnxDate,
            approvedBy: payload.approveBy,
            issuedBy: payload.issuedBy,
            paymentMethod: payload.paymentMethod,
            refference: payload.comment,
            accountNo: clientAcc.id,
            voucherNo: voucherNo.toString(),
            GL_TYPE: GL_TYPES.LIABILITY_GL,
            isDebit: true,
            isIncrease: false,
            clientId: clientId,
          };
          debitAmount += tnxAmount;

          // Credit Transaction in Asset Acc
          creditTransactionModel = {
            transactionType: TransactionTypes.CREDIT,
            transactionReason: "RETURN_TO_CUSTOMER",
            transactionCategory: "INTER_TRANSACTION",
            amount: tnxAmount,
            transactionDate: tnxDate,
            approvedBy: payload.approveBy,
            issuedBy: payload.issuedBy,
            paymentMethod: payload.paymentMethod,
            refference: payload.comment,
            accountNo: cashGl.id,
            voucherNo: voucherNo.toString(),
            GL_TYPE: GL_TYPES.ASSET_GL,
            isDebit: false,
            isIncrease: false,
            clientId: clientId,
          };
          creditAmount += tnxAmount;
        } else {
          // Credit Transaction in Liability Acc
          debitTransactionModel = {
            transactionType: TransactionTypes.CREDIT,
            transactionReason: "CUSTOMER_PAYMENT",
            transactionCategory: "CASH_TRANSACTION",
            amount: tnxAmount,
            transactionDate: tnxDate,
            approvedBy: payload.approveBy,
            issuedBy: payload.issuedBy,
            paymentMethod: payload.paymentMethod,
            refference: payload.comment,
            accountNo: clientAcc.id,
            voucherNo: voucherNo.toString(),
            GL_TYPE: GL_TYPES.LIABILITY_GL,
            isDebit: false,
            isIncrease: true,
            clientId: clientId,
          };
          creditAmount += tnxAmount;
          // Debit Transaction in Asset Acc
          creditTransactionModel = {
            transactionType: TransactionTypes.DEBIT,
            transactionReason: "CUSTOMER_PAYMENT",
            transactionCategory: "INTER_TRANSACTION",
            amount: tnxAmount,
            transactionDate: tnxDate,
            approvedBy: payload.approveBy,
            issuedBy: payload.issuedBy,
            paymentMethod: payload.paymentMethod,
            refference: payload.comment,
            accountNo: cashGl.id,
            voucherNo: voucherNo.toString(),
            GL_TYPE: GL_TYPES.ASSET_GL,
            isDebit: true,
            isIncrease: true,
            clientId: clientId,
          };
          debitAmount += tnxAmount;
        }
      } else if (payload.clientType == "SUPPLIER") {
        if (payload.isReturn) {
          // Debit Cash In Hand acc-Asset GL
          debitTransactionModel = {
            transactionType: TransactionTypes.DEBIT,
            transactionReason: "RETURN_FROM_SUPPLIER",
            transactionCategory: "CASH_TRANSACTION",
            amount: tnxAmount,
            transactionDate: tnxDate,
            approvedBy: payload.approveBy,
            issuedBy: payload.issuedBy,
            paymentMethod: payload.paymentMethod,
            refference: payload.comment,
            accountNo: cashGl.id,
            voucherNo: voucherNo.toString(),
            GL_TYPE: GL_TYPES.ASSET_GL,
            isDebit: true,
            isIncrease: true,
            clientId: clientId,
          };
          debitAmount += tnxAmount;
          // Credit Cash In Hand acc-Asset GL
          creditTransactionModel = {
            transactionType: TransactionTypes.CREDIT,
            transactionReason: "RETURN_FROM_SUPPLIER",
            transactionCategory: "INTER_TRANSACTION",
            amount: tnxAmount,
            transactionDate: tnxDate,
            approvedBy: payload.approveBy,
            issuedBy: payload.issuedBy,
            paymentMethod: payload.paymentMethod,
            refference: payload.comment,
            accountNo: clientAcc.id,
            voucherNo: voucherNo.toString(),
            GL_TYPE: GL_TYPES.ASSET_GL,
            isDebit: false,
            isIncrease: false,
            clientId: clientId,
          };
          creditAmount += tnxAmount;
        } else {
          // Debit suppliers acc-Asset GL
          debitTransactionModel = {
            transactionType: TransactionTypes.DEBIT,
            transactionReason: "PAYMENT_TO_SUPPLIER",
            transactionCategory: "CASH_TRANSACTION",
            amount: tnxAmount,
            transactionDate: tnxDate,
            approvedBy: payload.approveBy,
            issuedBy: payload.issuedBy,
            paymentMethod: payload.paymentMethod,
            refference: payload.comment,
            accountNo: clientAcc.id,
            voucherNo: voucherNo.toString(),
            GL_TYPE: GL_TYPES.ASSET_GL,
            isDebit: true,
            isIncrease: true,
            clientId: clientId,
          };
          debitAmount += tnxAmount;

          // Credit Cash In Hand-Asset GL
          creditTransactionModel = {
            transactionType: TransactionTypes.CREDIT,
            transactionReason: "PAYMENT_TO_SUPPLIER",
            transactionCategory: "INTER_TRANSACTION",
            amount: tnxAmount,
            transactionDate: tnxDate,
            approvedBy: payload.approveBy,
            issuedBy: payload.issuedBy,
            paymentMethod: payload.paymentMethod,
            refference: payload.comment,
            accountNo: cashGl.id,
            voucherNo: voucherNo.toString(),
            GL_TYPE: GL_TYPES.ASSET_GL,
            isDebit: false,
            isIncrease: false,
            clientId: clientId,
          };
          creditAmount += tnxAmount;
        }
      }

      let debitTransactionResult = await transactionRepo.doTransaction(
        debitTransactionModel
      );
      let creditTransactionResult = await transactionRepo.doTransaction(
        creditTransactionModel
      );
    });

    if (payload.taskId) {
      let taskDeleted = await ApprovalFlow.destroy({
        where: { id: payload.taskId },
      });
    }
    if (debitAmount != creditAmount) {
      throw new Error("Debit Credit not same");
    }
    return voucherNo.toString();
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.fetchTransactionReasons = async (req) => {
  let params = req.query;
  let clientId;
  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    let transactionReasons = await TransactionReason.findAll({
      where: { clientId: clientId },
    });
    return transactionReasons;
  } catch (error) {
    throw new Error(error);
  }
};

exports.addTransactionReason = async (req) => {
  let payload = req.body;
  let clientId;
  if (payload.clientId && payload.clientId != "") {
    clientId = payload.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    let reasonModel = {
      key: payload.key,
      value: payload.value,
      clientId: clientId,
    };
    let addedReason = await TransactionReason.create(reasonModel);
    return addedReason;
  } catch (error) {
    throw new Error("Failed " + error.message);
  }
};

exports.deleteTnxReason = async (req) => {
  let params = req.body;
  try {
    let deletedItem = await TransactionReason.destroy({
      where: { id: params.id },
    });
    return "Success";
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.doExpenseTransaction = async (req) => {
  let payload = req.body;
  let respose = "";
  let clientId;
  if (payload.clientId && payload.clientId != "") {
    clientId = payload.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    if (payload.transactionType == "EXPENSE") {
      respose = await doExpense(payload);
    } else if (payload.transactionType == "DEPOSIT") {
      respose = await doDeposit(payload);
    } else if (payload.transactionType == "DRAWING") {
      respose = await drawingTransaction(payload);
    } else if (payload.transactionType == "LOAN") {
      respose = await createLoan(payload);
    }
    if (payload.taskId) {
      let taskDeleted = await ApprovalFlow.destroy({
        where: { id: payload.taskId },
      });
    }
    return respose;
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.doSalaryPaymentTransaction = async (req) => {
  let payload = req.body;
  let tnxDate = new Date();
  let voucherNo = tnxDate.getTime();
  let expenseGLtnxModel;
  let cashInHandGLtnxModel;
  let tnxAmount = Number(payload.cashAmount);
  let clientId;
  if (payload.clientId && payload.clientId != "") {
    clientId = payload.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  let cashInHandAcc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.CASH_GL, clientId:clientId },
    include: GlAccount,
  });

  let employee = await Employee.findOne({
    where: { id: payload.receivedBy,clientId:clientId},
    include: [{ model: Account, include: GlAccount }, Person],
  });
  let creditAmount = 0;
  let debitAmount = 0;
  try {
    const result = await db.sequelize.transaction(async (t) => {
      expenseGLtnxModel = {
        transactionType: TransactionTypes.DEBIT,
        transactionReason: "Paying_Salary",
        transactionCategory: "SALARY",
        amount: tnxAmount,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: payload.paymentMethod,
        refference: payload.comment,
        accountNo: employee.account.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.EXPENSE_GL,
        isDebit: true,
        isIncrease: true,
        clientId:clientId
      };
      debitAmount += tnxAmount;
      cashInHandGLtnxModel = {
        transactionType: TransactionTypes.CREDIT,
        transactionReason: "Salary_Payment",
        transactionCategory: "SALARY",
        amount: tnxAmount,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: payload.paymentMethod,
        refference: payload.comment,
        accountNo: cashInHandAcc.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.CASH_GL,
        isDebit: false,
        isIncrease: false,
        clientId:clientId
      };
      creditAmount += tnxAmount;
      let expenseTnx = await transactionRepo.doTransaction(expenseGLtnxModel);
      let cashInHandTnx = await transactionRepo.doTransaction(
        cashInHandGLtnxModel
      );
      if (payload.taskId) {
        let taskDeleted = await ApprovalFlow.destroy({
          where: { id: payload.taskId },
        });
      }
      if (debitAmount != creditAmount) {
        throw new Error("Debit Credit not same");
      }
      return "Success";
    });
  } catch (err) {
    throw new Error(err.message);
  }
};
async function doDeposit(payload) {
  let tnxDate = new Date();
  let voucherNo = tnxDate.getTime();
  let cashInHandGLtnxModel = {};
  let InvestmentGLtnxModel = {};
  let clientId = payload.clientId;
  let tnxAmount = Number(payload.cashAmount);
  let debitAmount = 0;
  let creditAmount = 0;
  let investmentGlacc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.INVESTMENT_GL, clientId: clientId },
    include: GlAccount,
  });
  let chashInHandGLAcc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.CASH_GL, clientId: clientId },
    include: GlAccount,
  });
  try {
    const result = await db.sequelize.transaction(async (t) => {
      InvestmentGLtnxModel = {
        transactionType: TransactionTypes.CREDIT,
        transactionReason: payload.transactionReason,
        transactionCategory: TRANSACTION_CATEGORY.DEPOSIT,
        amount: tnxAmount,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: payload.paymentMethod,
        refference: payload.comment,
        accountNo: investmentGlacc.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.LIABILITY_GL,
        isDebit: false,
        isIncrease: true,
        clientId: clientId,
      };
      debitAmount += tnxAmount;
      cashInHandGLtnxModel = {
        transactionType: TransactionTypes.DEBIT,
        transactionReason: payload.transactionReason,
        transactionCategory: "DEPOSIT",
        amount: tnxAmount,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: payload.paymentMethod,
        refference: payload.comment,
        accountNo: chashInHandGLAcc.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.ASSET_GL,
        isDebit: true,
        isIncrease: true,
        clientId: clientId,
      };
      creditAmount += tnxAmount;
      let investmentTnx = await transactionRepo.doTransaction(InvestmentGLtnxModel);
      let cashInHandTnx = await transactionRepo.doTransaction(cashInHandGLtnxModel);
    });
    if (debitAmount != creditAmount) {
      throw new Error("Debit Credit not same");
    }
    return { voucherNo: voucherNo };
  } catch (error) {
    throw new Error(error.message);
  }
}
async function doExpense(payload) {
  let tnxDate = new Date();
  let voucherNo = tnxDate.getTime();
  let expenseGLtnxModel = {};
  let cashInHandGLtnxModel = {};
  let clientId = payload.clientId;
  let tnxAmount = Number(payload.cashAmount);
  let expenseGlacc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.EXPENSE_GL, clientId: clientId },
    include: GlAccount,
  });
  let chashInHandGLAcc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.CASH_GL, clientId: clientId },
    include: GlAccount,
  });
  let debitAmount = 0;
  let creditAmount = 0;
  try {
    const result = await db.sequelize.transaction(async (t) => {
      expenseGLtnxModel = {
        transactionType: TransactionTypes.DEBIT,
        transactionReason: payload.transactionReason,
        transactionCategory: TRANSACTION_CATEGORY.EXPENSE,
        amount: tnxAmount,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: payload.paymentMethod,
        refference: payload.comment,
        accountNo: expenseGlacc.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.ASSET_GL,
        isDebit: true,
        isIncrease: true,
        clientId: clientId,
      };
      debitAmount += tnxAmount;
      cashInHandGLtnxModel = {
        transactionType: TransactionTypes.CREDIT,
        transactionReason: payload.transactionReason,
        transactionCategory: "EXPENSE",
        amount: tnxAmount,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: payload.paymentMethod,
        refference: payload.comment,
        accountNo: chashInHandGLAcc.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.ASSET_GL,
        isDebit: false,
        isIncrease: false,
        clientId: clientId,
      };
      creditAmount += tnxAmount;
      let expenseTnx = await transactionRepo.doTransaction(expenseGLtnxModel);
      let cashInHandTnx = await transactionRepo.doTransaction(
        cashInHandGLtnxModel
      );
    });
    if (debitAmount != creditAmount) {
      throw new Error("Debit Credit not same");
    }
    return { voucherNo: voucherNo };
  } catch (error) {
    throw new Error(error.message);
  }
}
// async function paSalary(payload) {}
exports.payInstallment = async (req) => {
  let payload = req.body;
  let clientId;
  if (payload.clientId && payload.clientId != "") {
    clientId = payload.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  let tnxAmount = payload.installmentAmount;
  let tnxDate = new Date();
  let voucherNo = tnxDate.getTime();
  let cashInHandAccTnxModel = {};
  let loanAccTnxModel = {};
  let loanAcc = await Account.findOne({
    where: { id: payload.loanAccount },
    include: GlAccount,
  });
  let chashInHandGLAcc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.CASH_GL, clientId: clientId },
    include: GlAccount,
  });
  let debitAmount = 0;
  let creditAmount = 0;
  try {
    const result = await db.sequelize.transaction(async (t) => {
      cashInHandAccTnxModel = {
        transactionType: TransactionTypes.CREDIT,
        transactionReason: "Loan_Installment_Payment",
        transactionCategory: "LOAN",
        amount: tnxAmount,
        transactionDate: payload.payingDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: payload.paymentMethod,
        refference: payload.comment,
        accountNo: chashInHandGLAcc.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.ASSET_GL,
        isDebit: false,
        isIncrease: false,
        clientId: clientId,
      };
      creditAmount += tnxAmount;
      loanAccTnxModel = {
        transactionType: TransactionTypes.DEBIT,
        transactionReason: "Loan_Installment_Payment",
        transactionCategory: "LOAN",
        amount: tnxAmount,
        transactionDate: payload.payingDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: payload.paymentMethod,
        refference: "Loan Installment Payment Without Interest",
        accountNo: loanAcc.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.LIABILITY_GL,
        isDebit: true,
        isIncrease: false,
        clientId: clientId,
      };
      debitAmount += tnxAmount;
      let cashInHandTnx = await transactionRepo.doTransaction(
        cashInHandAccTnxModel
      );
      let loanTnx = await transactionRepo.doTransaction(loanAccTnxModel);
    });
    if (debitAmount != creditAmount) {
      throw new Error("Debit Credit not same");
    }
    return "Success";
  } catch (error) {
    throw new Error(error.message);
  }
};

async function createLoan(payload) {
  let tnxDate = new Date();
  let voucherNo = tnxDate.getTime();
  let cashInHandGLtnxModel = {};
  let loanAccTnxModel = {};
  let clientId = payload.clientId;
  let tnxAmount = Number(payload.cashAmount);
  let chashInHandGLAcc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.CASH_GL, clientId: clientId },
    include: GlAccount,
  });

  let liabilityGl = await GlAccount.findOne({
    where: { glName: GL_TYPES.LIABILITY_GL, clientId: clientId },
  });
  let accountModel = {
    balance: 0,
    accountType: "LOAN",
    glAccountId: liabilityGl.id,
    category: "CLIENT",
    clientId: clientId,
  };
  let account;
  let loanAcc;
  let creditAmount = 0;
  let debitAmount = 0;
  try {
      account = await Account.create(accountModel);
      let loanAccModel = {
        loanAmmount: tnxAmount,
        interestRate: payload.interestRate || 0,
        receiveDate: payload.receivedDate,
        returnDate: payload.returnDate,
        period: payload.period,
        issuedBy: payload.issuedBy,
        approvedBy: payload.approveBy,
        remark: payload.comment,
        status: "OPEN",
        loanClientId: payload.loanClientId,
        accountId: account.id,
        clientId: clientId,
      };
      loanAcc = await LoanAccount.create(loanAccModel);

    const tnxResult = await db.sequelize.transaction(async (t) => {
      loanAccTnxModel = {
        transactionType: TransactionTypes.CREDIT,
        transactionReason: "LOAN",
        transactionCategory: "LOAN",
        amount: tnxAmount,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: payload.paymentMethod,
        refference: payload.comment,
        accountNo: account.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.LIABILITY_GL,
        isDebit: false,
        isIncrease: true,
        clientId:clientId,
        transaction:t
      };
      creditAmount += tnxAmount;
      let loanTnx = await transactionRepo.doTransaction(loanAccTnxModel);

      cashInHandGLtnxModel = {
        transactionType: TransactionTypes.DEBIT,
        transactionReason: "DEPOSIT",
        transactionCategory: "LOAN",
        amount: tnxAmount,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: payload.paymentMethod,
        refference: payload.comment,
        accountNo: chashInHandGLAcc.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.ASSET_GL,
        isDebit: true,
        isIncrease: true,
        clientId:clientId,
        transaction:t
      };
      debitAmount += tnxAmount;
      let cashTnx = await transactionRepo.doTransaction(cashInHandGLtnxModel);
      if (debitAmount != creditAmount) {
        throw new Error("Debit Credit not same");
      }
      return "Success";
    });
  } catch (error) {
    throw new Error(error.message);
  }
}
//  to do add debit credit equal check
async function drawingTransaction(payload) {
  let tnxDate = new Date();
  let voucherNo = tnxDate.getTime();
  let cashInHandGLtnxModel = {};
  let drawingGLtnxModel = {};
  let tnxAmount = Number(payload.cashAmount);
  let clientId = payload.clientId;
  let chashInHandGLAcc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.CASH_GL, clientId: clientId },
    include: GlAccount,
  });
  let drawingGlAcc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.DRAWING_GL, clientId: clientId },
    include: GlAccount,
  });
  let creditAmount = 0;
  let debitAmount = 0;
  try {
    const result = await db.sequelize.transaction(async (t) => {
      drawingGLtnxModel = {
        transactionType: TransactionTypes.DEBIT,
        transactionReason: payload.transactionReason,
        transactionCategory: "DRAWING",
        amount: tnxAmount,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: payload.paymentMethod,
        refference: payload.comment,
        accountNo: drawingGlAcc.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.ASSET_GL,
        isDebit: true,
        isIncrease: true,
        payingTo: payload.payingTo,
        clientId: clientId,
        transaction:t
      };
      debitAmount += tnxAmount;
      cashInHandGLtnxModel = {
        transactionType: TransactionTypes.CREDIT,
        transactionReason: payload.transactionReason,
        transactionCategory: "DRAWING",
        amount: tnxAmount,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: payload.paymentMethod,
        refference: payload.comment,
        accountNo: chashInHandGLAcc.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.CASH_GL,
        isDebit: false,
        isIncrease: false,
        payingTo: payload.payingTo,
        clientId: clientId,
        transaction:t
      };
      creditAmount += tnxAmount;
      let drawingTnx = await transactionRepo.doTransaction(drawingGLtnxModel);
      let cashInHandTnx = await transactionRepo.doTransaction(
        cashInHandGLtnxModel
      );
    });
    if (debitAmount != creditAmount) {
      throw new Error("Debit Credit not same");
    }
    return "Success";
  } catch (error) {
    throw new Error(error.message);
  }
}
// accountModel = {
//   transactionDate:transactionDate ,
//   isDebit: isDebit,
//   tnxAmount: tnxAmount,
//   paymentMethod: paymentMethod,
//   refference: refference,
//   accountId: accountId,
//   isIncrease:isIncrease,
// 
