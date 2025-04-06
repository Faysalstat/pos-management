const SupplyInvoice = require("../model/supplyInvoice");
const TransactionRegistry = require("../model/transactionRegistry");
const transactionRepository = require("../repository/transactionRepository");
const {
  TransactionTypes,
  GL_TYPES,
  ACCOUNT_TYPES,
  TRANSACTION_CATEGORY,
} = require("../model/enums");
const Account = require("../model/account");
const Supplyer = require("../model/supplyer");
const Person = require("../model/person");
const { model } = require("mongoose");
const Order = require("../model/order");
const Product = require("../model/product");
const SupplyOrder = require("../model/supplyOrder");
const db = require("../connector/db-connector");
const Customer = require("../model/customer");
const SaleInvoice = require("../model/saleInvoice");
const AccountHistory = require("../model/accountHistory");
const SupplyDeliveryHistory = require("../model/supplyDeliveryHistory");
const ApprovalFlow = require("../model/approvalflow");
const SaleDeliveryHistory = require("../model/saleDeliveryHistory");
const { Op } = require("sequelize");
const GlAccount = require("../model/glAccounts");
const { Transaction } = require("sequelize/lib/sequelize");

exports.issueSaleOrder = async (req) => {
  let payload = req.body;
  if (payload.taskId) {
    let isTaskLocked = await taskIsLocked(payload.taskId);
    if (isTaskLocked) {
      throw new Error("Task Is Locked. Please Contact Developer!");
    }
  }
  let clientId;
  if (payload.clientId && payload.clientId != "") {
    clientId = payload.clientId;
  } else {
    throw new Error("Client ID not provided");
  }

  let orderIssueModel = {};
  let orders = payload.orders;
  let tnxDate = new Date();
  let invoice = {};
  let tnxAmount = +Number(payload.totalPaidAmount).toFixed(2);

  let voucherNo = tnxDate.getTime();
  let productAmount = payload.totalCost;
  let profit = payload.totalPrice - payload.totalCost;
  let extraCharge = payload.extraCharge || 0;
  let rebate = payload.rebate || 0;
  let customerPaidAmount = payload.totalPaidAmount || 0;
  let customerDebitAmount =
    payload.totalPrice + (payload.extraCharge || 0) - (payload.rebate || 0);
  let debitAmount = 0;
  let creditAmount = 0;

  let productGL = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.PRODUCT_GL, clientId: clientId },
    include: GlAccount,
  });

  let cashInHandGL = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.CASH_GL, clientId: clientId },
    include: GlAccount,
  });

  let incomeGL = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.INCOME_GL, clientId: clientId },
    include: GlAccount,
  });
  let extraChargeGl = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.EXTRA_CHARGE_GL, clientId: clientId },
    include: GlAccount,
  });
  let expenseGl = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.EXPENSE_GL, clientId: clientId },
    include: GlAccount,
  });
  let customer;
  let custAcc;

  try {
    orderIssueModel = {
      doNo: payload.doNo || "",
      invoiceNo: payload.invoiceNo || "",
      customerId: payload.customerId,
      purchaseDate: tnxDate,
      previousBalance: payload.previousBalance || 0,
      totalPrice: payload.totalPrice || 0,
      totalPayableAmount: payload.totalPayableAmount || 0,
      totalPaidAmount: payload.totalPaidAmount || 0,
      rebate: payload.rebate || 0,
      paymentMethod: payload.paymentMethod,
      extraCharge: payload.extraCharge || 0,
      chargeReason: payload.chargeReason,
      comment: payload.comment,
      issuedBy: payload.issuedBy,
      approvedBy: payload.approvedBy,
      deliveryStatus: "PENDING",
      voucherNo: voucherNo,
      clientId: clientId,
    };
    invoice = await SaleInvoice.create(orderIssueModel);
    for (let i = 0; i < orders.length; i++) {
      let order = orders[i];
      orderModel = {
        saleInvoiceId: invoice.id,
        productId: order.productId,
        pricePerUnit: order.pricePerUnit,
        buyingPricePerUnit: order.buyingPricePerUnit,
        packageQuantity: order.packageQuantity,
        looseQuantity: order.looseQuantity,
        quantityOrdered: order.quantityOrdered,
        quantityDelivered: 0,
        qunatityDeliveryPending: order.quantityOrdered,
        quantityReturned: 0,
        totalPrice: order.totalOrderPrice,
        state: "SOLD",
        tnxDate: new Date(),
        clientId: clientId,
      };
      let createdOrder = await Order.create(orderModel);
    }
    let invoiceNo = "INV" + (invoice.id < 10 ? "0" + invoice.id : invoice.id);
    let addInvoiceNo = await SaleInvoice.update(
      { invoiceNo: invoiceNo },
      { where: { id: invoice.id } }
    );
    let createdOrders = await Order.findAll({
      where: { saleInvoiceId: invoice.id },
    });
    for (let i = 0; i < createdOrders.length; i++) {
      let order = createdOrders[i];
      let orderNo = "O-" + (order.id < 10 ? "0" + order.id : order.id);
      let orderNoUpdated = await Order.update(
        { orderNo: orderNo },
        { where: { id: order.id } }
      );
      let deliveryModel = {
        invoiceId: invoice.id,
        deliverableQuantity: order.quantityOrdered,
        deliveryStatus: "DELIVERED",
        orderId: order.id,
      };
      let doDeliveryall = await doDeliver(deliveryModel);
    }
    // transaction started
    let customerAccDebitTnxModel = {};
    let customerAccCreditTnxModel = {};
    let cashGLTnxModel = {};
    let incomeGLTnxModel = {};
    let expenseGLDebitTnxModel = {};
    let extraChargeCreditGLTnxModel = {};
    let prodAccTnxModel = {};

    if (!payload.isWalkingCustomer) {
      customer = await Customer.findOne({
        where: { id: payload.customerId, clientId: clientId },
        include: [Account, Person],
      });
      custAcc = await Account.findOne({
        where: { id: customer.account.id, clientId: clientId },
        include: GlAccount,
      });
      customerAccDebitTnxModel = {
        transactionType: TransactionTypes.DEBIT,
        transactionReason: "Customer ACC Debited",
        transactionCategory: TRANSACTION_CATEGORY.PRODUCT_SALE,
        amount: customerDebitAmount,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: payload.paymentMethod,
        refference: "Payment on Invoice #" + invoiceNo,
        accountNo: custAcc.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.LIABILITY_GL,
        isDebit: true,
        isIncrease: false,
        clientId: clientId,
      };
      debitAmount += customerDebitAmount;
      let customerDebitTnxResult = await transactionRepository.doTransaction(
        customerAccDebitTnxModel
      );
    }

    if (customerPaidAmount != 0) {
      if (!payload.isWalkingCustomer) {
        // customer Credit Transaction
        customerAccCreditTnxModel = {
          transactionType: TransactionTypes.CREDIT,
          transactionReason: "Customer Cash Paid",
          transactionCategory: TRANSACTION_CATEGORY.PRODUCT_SALE,
          amount: customerPaidAmount,
          transactionDate: tnxDate,
          approvedBy: payload.approveBy,
          issuedBy: payload.issuedBy,
          paymentMethod: payload.paymentMethod,
          refference: "Payment on Invoice #" + invoiceNo,
          accountNo: custAcc.id,
          voucherNo: voucherNo.toString(),
          GL_TYPE: GL_TYPES.LIABILITY_GL,
          isDebit: false,
          isIncrease: true,
          clientId: clientId,
        };
        creditAmount += customerPaidAmount;
        let customerCreditTnxResult = await transactionRepository.doTransaction(
          customerAccCreditTnxModel
        );
      }
      // Cash In Hand Debit Transaction
      cashGLTnxModel = {
        transactionType: TransactionTypes.DEBIT,
        transactionReason: "CASH in Hand Debited",
        transactionCategory: TRANSACTION_CATEGORY.PRODUCT_SALE,
        amount: customerPaidAmount,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: payload.paymentMethod,
        refference: "Payment on Invoice #" + invoiceNo,
        accountNo: cashInHandGL.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.ASSET_GL,
        isDebit: true,
        isIncrease: true,
        clientId: clientId,
      };
      debitAmount += customerPaidAmount;
      let cashGlDebitTnxResult = await transactionRepository.doTransaction(
        cashGLTnxModel
      );
    }
    if (rebate != 0) {
      expenseGLDebitTnxModel = {
        transactionType: TransactionTypes.DEBIT,
        transactionReason: "Discount on sale",
        transactionCategory: TRANSACTION_CATEGORY.EXPENSE,
        amount: rebate,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: payload.paymentMethod,
        refference: "Discount on Invoice #" + invoiceNo,
        accountNo: expenseGl.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.EXPENSE_GL,
        isDebit: true,
        isIncrease: true,
        clientId: clientId,
      };
      debitAmount += rebate;
      let expenseDebitTnxResult = await transactionRepository.doTransaction(
        expenseGLDebitTnxModel
      );
    }
    if (extraCharge != 0) {
      extraChargeCreditGLTnxModel = {
        transactionType: TransactionTypes.CREDIT,
        transactionReason: "Extra Charge From Customer",
        transactionCategory: TRANSACTION_CATEGORY.EXTRA_CHARGE,
        amount: extraCharge,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: payload.paymentMethod,
        refference: "Extra Charge on Invoice #" + invoiceNo,
        accountNo: extraChargeGl.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.INCOME_GL,
        isDebit: false,
        isIncrease: true,
        clientId: clientId,
      };
      creditAmount += extraCharge;
      let extraChargeCreditGLTnxResult =
        await transactionRepository.doTransaction(extraChargeCreditGLTnxModel);
    }

    // product Acc Credit
    prodAccTnxModel = {
      transactionType: TransactionTypes.CREDIT,
      transactionReason: "Product Cost Price Credited",
      transactionCategory: TRANSACTION_CATEGORY.PRODUCT_SALE,
      amount: productAmount,
      transactionDate: tnxDate,
      approvedBy: payload.approveBy,
      issuedBy: payload.issuedBy,
      paymentMethod: "Inter_Transaction",
      refference: "Product Sold on Invoice #" + invoiceNo,
      accountNo: productGL.id,
      voucherNo: voucherNo.toString(),
      GL_TYPE: GL_TYPES.ASSET_GL,
      isDebit: false,
      isIncrease: false,
      clientId: clientId,
    };
    creditAmount += productAmount;
    let productCreditTnxResult = await transactionRepository.doTransaction(
      prodAccTnxModel
    );

    // Income Acc Credit Transaction
    incomeGLTnxModel = {
      transactionType: TransactionTypes.CREDIT,
      transactionReason: "Profit From Sale",
      transactionCategory: TRANSACTION_CATEGORY.PRODUCT_SALE,
      amount: profit,
      transactionDate: tnxDate,
      approvedBy: payload.approveBy,
      issuedBy: payload.issuedBy,
      paymentMethod: "Inter_Transaction",
      refference: "Profit on Invoice #" + invoiceNo,
      accountNo: incomeGL.id,
      voucherNo: voucherNo.toString(),
      GL_TYPE: GL_TYPES.INCOME_GL,
      isDebit: false,
      isIncrease: true,
      clientId: clientId,
    };
    creditAmount += profit;
    let profitCreditTnxResult = await transactionRepository.doTransaction(
      incomeGLTnxModel
    );
    if (payload.taskId) {
      let taskDeleted = await ApprovalFlow.destroy({
        where: { id: payload.taskId },
      });
    }

    if (debitAmount != creditAmount) {
      throw new Error("Debit and Credit are not Same");
    }
    return {
      isSuccess: true,
      message: "Order Placed Successfuly",
      body: {
        invoiceNo: invoiceNo,
      },
    };
  } catch (error) {
    let deleteOrder = await Order.destroy({
      where: { saleInvoiceId: invoice.id },
    });
    let deleteInvoice = await SaleInvoice.destroy({
      where: { id: invoice.id },
    });

    // let previousGlBal = +Number(inventoryAcc.balance - invoice.totalPaid).toFixed(2);
    // let previousAccBal = +Number(customer.account.balance + invoice.totalPaid).toFixed(2);
    // let reversedGLAcc = await Account.update(
    //   { balance: previousGlBal },
    //   { where: { id: inventoryAcc.id } }
    // );
    // let reversedAcc = await Account.update(
    //   { balance: previousAccBal },
    //   { where: { id: customer.account.id } }
    // );
    // let deleteCustomerAccountDebitHistory = await AccountHistory.destroy({
    //   where: { id: customerDebitAccountHistory.id },
    // });
    // let deleteCustomerAccountCreditHistory = await AccountHistory.destroy({
    //   where: { id: customerCreditAccountHistory.id },
    // });
    // let deleteGlAccountHistory = await AccountHistory.destroy({
    //   where: { id: glAccountHistory.id },
    // });
    return {
      isSuccess: false,
      message: "Order Placed Faileds Error:" + error.message,
    };
  }
};

exports.cancelSaleOrder = async (req) => {
  let payload = req.body;
  let clientId;
  if (payload.clientId && payload.clientId != "") {
    clientId = payload.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  let invoice = await SaleInvoice.findOne({
    where: { invoiceNo: payload.invoiceNo, clientId: clientId },
    include: Order,
  });

  let productGL = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.PRODUCT_GL, clientId: clientId },
    include: GlAccount,
  });

  let cashInHandGL = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.CASH_GL, clientId: clientId },
    include: GlAccount,
  });

  let incomeGL = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.INCOME_GL, clientId: clientId },
    include: GlAccount,
  });
  let extraChargeGl = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.EXTRA_CHARGE_GL, clientId: clientId },
    include: GlAccount,
  });
  let expenseGl = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.EXPENSE_GL, clientId: clientId },
    include: GlAccount,
  });
  let customer = await Customer.findOne({
    where: { id: invoice.customerId, clientId: clientId },
    include: [Account, Person],
  });

  let custAcc = await Account.findOne({
    where: { id: customer.account.id, clientId: clientId },
    include: GlAccount,
  });
  let productValue = 0;
  let profit = 0;
  let extraCharge = invoice.extraCharge;
  let rebate = invoice.rebate;
  let customerPaid = invoice.totalPaidAmount;
  let totalPrice = 0;
  let totalBill = invoice.totalPayableAmount;
  try {
    for (let i = 0; i < invoice.orders.length; i++) {
      let order = invoice.orders[i];
      totalPrice += +Number(order.quantityOrdered * order.pricePerUnit).toFixed(
        2
      );
      productValue += +Number(
        order.quantityOrdered * order.buyingPricePerUnit
      ).toFixed(2);
    }
    profit = totalPrice - productValue;
    const result = await db.sequelize.transaction(async (t) => {
      // product gl updated
      let updatedProductBalance = productGL.balance + productValue;
      let updatedProductGL = productGL.glAccount.balance + productValue;
      await Account.update(
        { balance: updatedProductBalance },
        { where: { id: productGL.id } },
        { transaction: t }
      );
      await GlAccount.update(
        { balance: updatedProductGL },
        { where: { id: productGL.glAccount.id } },
        { transaction: t }
      );

      // Expense Gl Update
      let updatedExpenseBalance = expenseGl.balance - rebate;
      let updatedExpenseGL = expenseGl.glAccount.balance - rebate;
      await Account.update(
        { balance: updatedExpenseBalance },
        { where: { id: expenseGl.id } },
        { transaction: t }
      );
      await GlAccount.update(
        { balance: updatedExpenseGL },
        { where: { id: expenseGl.glAccount.id } },
        { transaction: t }
      );

      // Income Gl Update
      let updatedIncomeBalance = incomeGL.balance - profit;
      let updatedIncomeGL = incomeGL.glAccount.balance - profit;
      await Account.update(
        { balance: updatedIncomeBalance },
        { where: { id: incomeGL.id } },
        { transaction: t }
      );
      await GlAccount.update(
        { balance: updatedIncomeGL },
        { where: { id: incomeGL.glAccount.id } },
        { transaction: t }
      );

      // Extra Charge Gl Update
      let updatedExtraChargeBalance = extraChargeGl.balance - extraCharge;
      let updatedExtraChargeGL = extraChargeGl.glAccount.balance - extraCharge;
      await Account.update(
        { balance: updatedExtraChargeBalance },
        { where: { id: extraChargeGl.id } },
        { transaction: t }
      );
      await GlAccount.update(
        { balance: updatedExtraChargeGL },
        { where: { id: extraChargeGl.glAccount.id } },
        { transaction: t }
      );

      // // Customer Account Update
      let updatedCustomeralance = custAcc.balance - customerPaid + totalBill;
      let updatedCustomerGL =
        custAcc.glAccount.balance - customerPaid + totalBill;
      await Account.update(
        { balance: updatedCustomeralance },
        { where: { id: custAcc.id } },
        { transaction: t }
      );
      await GlAccount.update(
        { balance: updatedCustomerGL },
        { where: { id: custAcc.glAccount.id } },
        { transaction: t }
      );

      // Cash In hand Account Update
      let updatedCashInHandBalance = cashInHandGL.balance - customerPaid;
      let updatedCashInHandGL =
        cashInHandGL.glAccount.balance - customerPaid + totalBill;
      await Account.update(
        { balance: updatedCashInHandBalance },
        { where: { id: cashInHandGL.id } },
        { transaction: t }
      );
      await GlAccount.update(
        { balance: updatedCashInHandGL },
        { where: { id: cashInHandGL.glAccount.id } },
        { transaction: t }
      );

      // Deleting history and transaction registry
      await AccountHistory.destroy(
        {
          where: { voucherNo: invoice.voucherNo, clientId: clientId },
        },
        { transaction: t }
      );
      await TransactionRegistry.destroy(
        {
          where: { voucherNo: invoice.voucherNo, clientId: clientId },
        },
        { transaction: t }
      );

      await Order.destroy(
        { where: { saleInvoiceId: invoice.id } },
        { transaction: t }
      );
      await SaleInvoice.destroy({ where: { id: invoice.id } }),
        { transaction: t };
    });
    return {
      isSuccess: true,
      message: "Sale Invoice Cancelled",
    };
  } catch (error) {
    throw new Error("Some Error Occured");
  }
};
exports.issueSupplyOrder = async (req) => {
  let payload = req.body;
  let clientId;
  if (payload.clientId && payload.clientId != "") {
    clientId = payload.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  if (payload.taskId) {
    let isTaskLocked = await taskIsLocked(payload.taskId);
    if (isTaskLocked) {
      throw new Error("Task Is Locked. Please Contact Developer!");
    }
  }
  let orderIssueModel = {};
  let orders = payload.orders;
  let tnxDate = new Date();
  let voucherNo = tnxDate.getTime();
  let invoice = {};
  let transactionReg = {};
  let creditAmount = 0;
  let debitAmount = 0;
  let tnxAmount = +Number(payload.totalPrice).toFixed(2);
  let supplyer = await Supplyer.findOne({
    where: { id: payload.supplyerId, clientId: clientId },
    include: [Account, Person],
  });
  let clientAcc = await Account.findOne({
    where: { id: supplyer.account.id, clientId: clientId },
    include: GlAccount,
  });
  let cashInHandAcc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.CASH_GL, clientId: clientId },
    include: GlAccount,
  });
  let incomeAcc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.INCOME_GL, clientId: clientId },
    include: GlAccount,
  });

  let productAcc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.PRODUCT_GL, clientId: clientId },
    include: GlAccount,
  });

  let supplierAccTnxModel = {};
  let cashInHandAccTnxModel = {};
  let productAccTnxModel = {};
  let incomeAccTnxModel = {};
  try {
    orderIssueModel = {
      doNo: payload.doNo,
      purchaseDate: tnxDate,
      totalPrice: payload.totalPrice,
      rebate: payload.rebate || 0,
      remarks: payload.comment,
      deliveryStatus: "PENDING",
      supplyerId: payload.supplyerId,
      issuedBy: payload.issuedBy,
      approvedBy: payload.approvedBy,
      clientId: clientId,
    };
    invoice = await SupplyInvoice.create(orderIssueModel);
    for (let i = 0; i < orders.length; i++) {
      let order = orders[i];
      orderModel = {
        supplyInvoiceId: invoice.id,
        productId: order.productId,
        packageQuantity: order.packageQuantity,
        looseQuantity: order.looseQuantity,
        quantityOrdered: order.quantityOrdered,
        pricePerUnit: order.pricePerUnit,
        totalPrice: order.totalOrderPrice,
        state: "PURCHASED",
        deliveryStatus: "PENDING",
        quantityDelivered: 0,
        qunatityDeliveryPending: order.quantityOrdered,
        tnxDate: new Date(),
        quantityReturned: 0,
        clientId: clientId,
      };
      let createdOrder = await SupplyOrder.create(orderModel);
    }

    let invoiceNo = "SUP" + (invoice.id < 10 ? "0" + invoice.id : invoice.id);
    let addInvoiceNo = await SupplyInvoice.update(
      { invoiceNo: invoiceNo },
      { where: { id: invoice.id } }
    );
    let createdOrders = await SupplyOrder.findAll({
      where: { supplyInvoiceId: invoice.id, clientId: clientId },
    });
    for (let i = 0; i < createdOrders.length; i++) {
      let order = createdOrders[i];
      let orderNo = "SO-" + (order.id < 10 ? "0" + order.id : order.id);
      console.log(orderNo + " and ID " + order.id);
      let orderNoUpdated = await SupplyOrder.update(
        { orderNo: orderNo },
        { where: { id: order.id } }
      );
    }
    // transaction start
    const result = await db.sequelize.transaction(async (t) => {
      // supplier acc tnx
      supplierAccTnxModel = {
        transactionType: TransactionTypes.CREDIT,
        transactionReason: "Supplier Acc Debited",
        transactionCategory: TRANSACTION_CATEGORY.PRODUCT_PURCHASE,
        amount: tnxAmount - payload.rebate,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: "Inter_Transaction",
        refference: "Product Purchase on Invoice #" + invoiceNo,
        accountNo: clientAcc.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.ASSET_GL,
        isDebit: false,
        isIncrease: false,
        clientId: clientId,
        transaction: t,
      };
      creditAmount += tnxAmount - payload.rebate;
      let supplierAccTnx = await transactionRepository.doTransaction(
        supplierAccTnxModel
      );

      if (payload.rebate < 0) {
        // Income acc tnx for rebate
        incomeAccTnxModel = {
          transactionType: TransactionTypes.CREDIT,
          transactionReason: "Income Acc Debited By Discount",
          transactionCategory: TRANSACTION_CATEGORY.DISCOUNT,
          amount: payload.rebate,
          transactionDate: tnxDate,
          approvedBy: payload.approveBy,
          issuedBy: payload.issuedBy,
          paymentMethod: "Inter_Transaction",
          refference: "Discount Received on Invoice #" + invoiceNo,
          accountNo: incomeAcc.id,
          voucherNo: voucherNo.toString(),
          GL_TYPE: GL_TYPES.INCOME_GL,
          isDebit: false,
          isIncrease: true,
          clientId: clientId,
          transaction: t,
        };
        creditAmount += payload.rebate;
        let incomeAccTnx = await transactionRepository.doTransaction(
          incomeAccTnxModel
        );
      }

      // product acc tnx
      productAccTnxModel = {
        transactionType: TransactionTypes.DEBIT,
        transactionReason: "Stock Added",
        transactionCategory: TRANSACTION_CATEGORY.PRODUCT_PURCHASE,
        amount: tnxAmount,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: "Inter_Transaction",
        refference: "Stock Updated on Invoice #" + invoiceNo,
        accountNo: productAcc.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.ASSET_GL,
        isDebit: true,
        isIncrease: true,
        clientId: clientId,
        transaction: t,
      };
      debitAmount += tnxAmount;
      let productAccTnx = await transactionRepository.doTransaction(
        productAccTnxModel
      );
    });
    if (payload.taskId) {
      let taskDeleted = await ApprovalFlow.destroy({
        where: { id: payload.taskId },
      });
    }
    return {
      status: "SUCCESS",
      invoiceNo: invoiceNo,
    };
  } catch (error) {
    let deleteInvoice = await SupplyInvoice.destroy({
      where: { id: invoice.id },
    });
    let deleteTransaction = await TransactionRegistry.destroy({
      where: { id: transactionReg.id },
    });
    let deleteOrder = await SupplyInvoice.destroy({
      where: { invoiceId: invoice.id },
    });
    let previousAccBal = +Number(
      supplyer.account.balance + invoice.totalPaid
    ).toFixed(2);
    let deleteCustomerAccountHistory = await AccountHistory.destroy({
      where: { id: supplyerAccountHistory.id },
    });
    let reversedAcc = await Account.update(
      { balance: previousAccBal },
      { where: { id: supplyer.account.id } }
    );
    return "FAILED";
  }
};
exports.updateSupplyOrder = async (req) => {
  let payload = req.body;
  try {
    let updatedInvoice = await SupplyInvoice.update(
      { remarks: payload.comment },
      { where: { id: payload.invoiceId } }
    );
    return "SUCCESS";
  } catch (error) {
    return "FAILED";
  }
};

exports.getSupplyInvoiceList = async (req) => {
  let params = req.query;
  let offsets = Number(params.offset);
  let limit = Number(params.limit);
  let query = {};
  let fromDate = new Date("01-01-2023");
  let toDate = new Date();
  let invoiceList = [];
  if (params.clientId && params.clientId != "") {
    query.clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  if (params.invoiceNo && params.invoiceNo != "") {
    query.invoiceNo = params.invoiceNo;
  }
  if (params.deliveryStatus && params.deliveryStatus != "") {
    query.deliveryStatus = params.deliveryStatus;
  }
  if (params.code && params.code != "") {
    let supplier = await Supplyer.findOne({
      where: { code: params.code },
    });
    query.supplyerId = supplier?.id;
  }
  if (params.fromDate && params.fromDate != "") {
    fromDate = new Date(params.fromDate);
  }
  if (params.toDate && params.toDate != "") {
    toDate = new Date(params.toDate);
  }
  query.purchaseDate = { [Op.between]: [fromDate, toDate] };
  try {
    invoiceList = await SupplyInvoice.findAll({
      offset: offsets,
      limit: limit,
      where: query,
      include: [
        { model: Supplyer, include: [Account, Person] },
        { model: SupplyOrder, include: [Product] },
      ],
      order: [["id", "DESC"]],
    });
    return invoiceList;
  } catch (error) {
    throw new Error("Fetching List failed " + error.message);
  }
};
exports.getSupplyOrderById = async (req) => {
  let params = req.query;
  let invoice = {};
  let clientId;
  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    invoice = await SupplyInvoice.findOne({
      where: { id: params.invoiceId, clientId: clientId },
      include: [
        { model: Supplyer, include: [Account, Person] },
        { model: SupplyOrder, include: [Product] },
      ],
    });

    return invoice;
  } catch (error) {
    throw new Error("Fetching List failed " + error.message);
  }
};
exports.getSaleOrderList = async (req) => {
  let params = req.query;
  let offsets = Number(req.query.offset);
  let limit = Number(req.query.limit);
  let fromDate = new Date("01-01-2023");
  let toDate = new Date();
  let invoiceList = [];
  let query = {};
  if (params.clientId && params.clientId != "") {
    query.clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  if (params.invoiceNo && params.invoiceNo != "") {
    query.invoiceNo = params.invoiceNo;
  }
  if (params.deliveryStatus && params.deliveryStatus != "") {
    query.deliveryStatus = params.deliveryStatus;
  }
  if (params.contactNo && params.contactNo != "") {
    let person = await Person.findOne({
      where: { contactNo: params.contactNo, clientId: query.clientId },
      include: Customer,
    });
    query.customerId = person?.customer?.id;
  }
  if (params.fromDate && params.fromDate != "") {
    fromDate = new Date(params.fromDate);
  }
  if (params.toDate && params.toDate != "") {
    toDate = new Date(params.toDate);
  }
  if (params.issuedBy && params.issuedBy != "") {
    query.issuedBy = params.issuedBy;
  }
  query.purchaseDate = { [Op.between]: [fromDate, toDate] };
  try {
    invoiceList = await SaleInvoice.findAll({
      offset: offsets,
      limit: limit,
      where: query,
      order: [["id", "DESC"]],
      include: [
        { model: Customer, include: [Account, Person] },
        { model: Order, include: [Product] },
      ],
    });
    // invoiceList.forEach(async (invoice)=>{
    //   await checkandUpdateOrderNo(invoice.orders);
    // })
    // await fixproductStock();
    return invoiceList;
  } catch (error) {
    throw new Error("Fetching List failed " + error.message);
  }
};

// TO DO
// Start Putting Client ID from here
exports.getSaleOrderById = async (req) => {
  let params = req.query;
  let invoiceId = params.invoiceId;
  let invoice = {};
  let clientId;
  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    invoice = await SaleInvoice.findOne({
      where: { id: invoiceId },
      include: [
        { model: Customer, include: [Account, Person] },
        { model: Order, include: [Product] },
      ],
    });
    // await checkandUpdateOrderNo(invoice.orders);
    return invoice;
  } catch (error) {
    throw new Error("Fetching List failed " + error.message);
  }
};
exports.doSupplyOrderDelievary = async (req) => {
  let payload = req.body;
  let delievry = {};
  let supplyOrder = {};
  let product = {};
  let clientId;
  if (payload.clientId && payload.clientId != "") {
    clientId = payload.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    const result = await db.sequelize.transaction(async (t) => {
      supplyOrder = await SupplyOrder.findOne({
        where: { id: payload.orderId },
      });
      product = await Product.findOne({ where: { id: supplyOrder.productId } });
      // update product quantity
      let updatedProductQuantity =
        product.quantity + payload.deliverableQuantity;
      let updatedProduct = await Product.update(
        { quantity: updatedProductQuantity },
        { where: { id: product.id } },
        { transaction: t }
      );
      // update supply order quantity delievred
      let updatedDeliveredQuantity =
        supplyOrder.quantityDelivered + payload.deliverableQuantity;
      let updatedDeliveryPending =
        supplyOrder.qunatityDeliveryPending - payload.deliverableQuantity;
      if (updatedDeliveryPending == 0 || updatedDeliveryPending < 0) {
        supplyOrder.deliveryStatus = "DELIVERED";
      }
      let updatedSupplyOrder = await SupplyOrder.update(
        {
          quantityDelivered: updatedDeliveredQuantity,
          qunatityDeliveryPending: updatedDeliveryPending,
          deliveryStatus: supplyOrder.deliveryStatus,
        },
        {
          where: { id: supplyOrder.id },
        },
        { transaction: t }
      );
      let deliveryHistory = {
        deliverableQuantity: payload.deliverableQuantity,
        deliveryDate: payload.scheduledDate,
        deliveryType: "SUPPLY",
        deliveredTo: "INVENTORY",
        supplyInvoiceId: supplyOrder.supplyInvoiceId,
        clientId: clientId,
      };
      delievry = await SupplyDeliveryHistory.create(deliveryHistory, {
        transaction: t,
      });
    });
    let invoice = await SupplyInvoice.findOne({
      where: { id: payload.invoiceId },
      include: SupplyOrder,
    });
    invoice.isSale = false;
    let updatedInvoice = await updateDeliveryStatus(invoice);
    return delievry;
  } catch (error) {
    throw new Error("delievry falied");
  }
};

exports.doSaleOrderDelievary = async (req) => {
  let payload = req.body;
  let delievry = {};
  let saleOrder = {};
  let product = {};
  let clientId;
  if (payload.clientId && payload.clientId != "") {
    clientId = payload.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    const result = await db.sequelize.transaction(async (t) => {
      let deliveryModel = {
        deliverableQuantity: payload.deliverableQuantity,
        scheduledDate: payload.scheduledDate,
        deliveryStatus: payload.deliveryStatus,
        state: payload.state,
        supplyOrderId: payload.orderId,
        clientId: clientId,
      };
      saleOrder = await Order.findOne({
        where: { id: payload.orderId },
      });
      product = await Product.findOne({ where: { id: saleOrder.productId } });
      // update product quantity
      // let updatedProductQuantity =
      //   product.quantity - payload.deliverableQuantity;

      let updatedSoldQuantity =
        product.quantitySold + payload.deliverableQuantity;
      let updatedProduct = await Product.update(
        { quantitySold: updatedSoldQuantity },
        { where: { id: product.id } },
        { transaction: t }
      );
      // update supply order quantity delievred
      let updatedDeliveredQuantity =
        saleOrder.quantityDelivered + payload.deliverableQuantity;
      let updatedDeliveryPending =
        saleOrder.qunatityDeliveryPending - payload.deliverableQuantity;
      if (updatedDeliveryPending == 0 || updatedDeliveryPending < 0) {
        saleOrder.deliveryStatus = "DELIVERED";
      }
      let updatedSaleOrder = await Order.update(
        {
          quantityDelivered: updatedDeliveredQuantity,
          deliveryStatus: saleOrder.deliveryStatus,
          qunatityDeliveryPending: updatedDeliveryPending,
        },
        {
          where: { id: saleOrder.id },
        },
        { transaction: t }
      );
      let deliveryHistory = {
        deliverableQuantity: payload.deliverableQuantity,
        deliveryDate: payload.scheduledDate,
        deliveryType: "SALE",
        deliveredTo: "CUSTOMER",
        saleInvoiceId: saleOrder.saleInvoiceId,
        clientId: clientId,
      };
      delievry = await SaleDeliveryHistory.create(deliveryHistory, {
        transaction: t,
      });
    });

    let invoice = await SaleInvoice.findOne({
      where: { id: payload.invoiceId },
      include: Order,
    });
    invoice.isSale = true;
    let updatedInvoice = await updateDeliveryStatus(invoice);
    return "SUCCESS";
  } catch (error) {
    throw new Error("delievry falied");
  }
};

async function doDeliver(deliveryModel) {
  try {
    const result = await db.sequelize.transaction(async (t) => {
      let saleOrder = await Order.findOne({
        where: { id: deliveryModel.orderId },
      });
      let product = await Product.findOne({
        where: { id: saleOrder.productId },
      });
      let updatedSoldQuantity =
        product.quantitySold + deliveryModel.deliverableQuantity;
      let updatedQuantity =
        product.quantity - deliveryModel.deliverableQuantity;
      let updatedProduct = await Product.update(
        { quantity: updatedQuantity, quantitySold: updatedSoldQuantity },
        { where: { id: product.id } },
        { transaction: t }
      );
      // update supply order quantity delievred
      let updatedDeliveredQuantity =
        saleOrder.quantityDelivered + deliveryModel.deliverableQuantity;
      let updatedDeliveryPending =
        saleOrder.qunatityDeliveryPending - deliveryModel.deliverableQuantity;
      if (updatedDeliveryPending == 0 || updatedDeliveryPending < 0) {
        saleOrder.deliveryStatus = "DELIVERED";
      }
      let updatedSaleOrder = await Order.update(
        {
          quantityDelivered: updatedDeliveredQuantity,
          deliveryStatus: saleOrder.deliveryStatus,
          qunatityDeliveryPending: updatedDeliveryPending,
        },
        {
          where: { id: saleOrder.id },
        },
        { transaction: t }
      );
    });

    let invoice = await SaleInvoice.findOne({
      where: { id: deliveryModel.invoiceId },
      include: Order,
    });
    invoice.isSale = true;
    let updatedInvoice = await updateDeliveryStatus(invoice);
    return true;
  } catch (error) {
    throw new Error("delievry falied");
  }
}
// cancelIdleCallback, not using
exports.doPayment = async (req) => {
  let payload = req.body;
  let transactionModel = {};
  let tnxDate = new Date();
  let clientId;
  if (payload.clientId && payload.clientId != "") {
    clientId = payload.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  let invoice = await SaleInvoice.findOne({ where: { id: payload.invoiceId } });
  let clientAcc = await Account.findOne({ where: { id: payload.accountId } });
  let glAcc = await Account.findOne({
    where: { accountType: GL_TYPES.INVENTORY_GL, clientId: clientId },
  });
  let updatedAccBalance = +Number(
    clientAcc.balance - payload.newPayment
  ).toFixed(2);
  let updatedGLBalance = +Number(glAcc.balance + payload.newPayment).toFixed(2);

  try {
    const result = await db.sequelize.transaction(async (t) => {
      let updateInvoiceModel = {
        totalPaid: payload.updatedPaidAmount,
        duePayment: payload.updatedDueAmount,
        rebate: payload.updatedRebateAmount,
      };

      let transactionModel = {
        transactionType: TransactionTypes.INCOME,
        transactionReason: "Due Payment",
        transactionCategory: "SALE ORDER",
        income: payload.newPayment,
        expense: 0,
        transactionDate: tnxDate,
        approvedBy: "ADMIN",
        issuedBy: "MANAGER",
        refference: payload.comment,
        receivedBy: glAcc.id,
        receivedFrom: clientAcc.id,
        payTo: "GL Account No " + glAcc.id,
        voucherNo: "",
        GL_TYPE: GL_TYPES.INVENTORY_GL,
        clientId: clientId,
      };
      let invoiceModel = await SaleInvoice.update(
        updateInvoiceModel,
        { where: { id: invoice.id } },
        { transaction: t }
      );
      let updatedAcc = await Account.update(
        { balance: updatedAccBalance },
        { where: { id: clientAcc.id } },
        { transaction: t }
      );
      let updatedGlAcc = await Account.update(
        { balance: updatedGLBalance },
        { where: { id: glAcc.id } },
        { transaction: t }
      );
      let transaction = await TransactionRegistry.create(transactionModel, {
        transaction: t,
      });
      let accHistory = await AccountHistory.bulkCreate(
        [
          {
            tnxDate: tnxDate,
            tnxType: "DEBIT",
            tnxAmount: payload.newPayment,
            remark: payload.remark,
            accountId: clientAcc.id,
            clientId: clientId,
          },
          {
            tnxDate: tnxDate,
            tnxType: "CREDIT",
            tnxAmount: payload.newPayment,
            remark: payload.remark,
            accountId: glAcc.id,
            clientId: clientId,
          },
        ],
        { transaction: t }
      );
      return "SUCCESS";
    });
  } catch (error) {
    throw new Error("Payment Failed " + error.message);
  }
};
exports.updateSaleOrder = async (req) => {
  let payload = req.body;

  try {
    let updatedInvoice = await SaleInvoice.update(
      { comment: payload.comment },
      { where: { id: payload.invoiceId } }
    );
    return "SUCCESS";
  } catch (error) {
    return "FAILED";
  }
};

async function updateDeliveryStatus(invoice) {
  let deliveryStatus = "DELIVERED";
  let orders = [];
  if (invoice.isSale) {
    orders = invoice.orders;
  } else {
    orders = invoice.supplyOrders;
  }

  for (let i = 0; i < orders.length; i++) {
    let order = orders[i];
    if (order.deliveryStatus != "DELIVERED") {
      deliveryStatus = "PENDING";
      break;
    }
  }
  try {
    if (deliveryStatus == "DELIVERED") {
      if (invoice.isSale) {
        let updatedInvoice = await SaleInvoice.update(
          { deliveryStatus: deliveryStatus },
          { where: { id: invoice.id } }
        );
      } else {
        let updatedInvoice = await SupplyInvoice.update(
          { deliveryStatus: deliveryStatus },
          { where: { id: invoice.id } }
        );
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
}
async function generateOrderNo() {
  let date = new Date();
  return date.getTime();
}

async function productSaleTransaction(payload) {}
async function productPurchaseTransaction(payload) {}

exports.returnSaleOrder = async (req) => {
  let payload = req.body;
  let orders = payload.orders;
  let tnxDate = new Date();
  let clientId;
  if (payload.clientId && payload.clientId != "") {
    clientId = payload.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  let voucherNo = tnxDate.getTime();
  let invoice = await SaleInvoice.findOne({ where: { id: payload.invoiceId } });
  let cusAcc = await Account.findOne({
    where: { id: payload.cusAcc },
    include: GlAccount,
  });
  let productAcc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.PRODUCT_GL, clientId: clientId },
    include: GlAccount,
  });
  let cashInHandAcc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.CASH_GL, clientId: clientId },
    include: GlAccount,
  });
  let expenseAcc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.EXPENSE_GL, clientId: clientId },
    include: GlAccount,
  });
  let custAccTnxModel = {};
  let prodAccTnxModel = {};
  let expenseAccTnxModel = {};
  let creditAmount = 0;
  let debitAmount = 0;
  try {
    const result = await db.sequelize.transaction(async (t) => {
      if (payload.returnType == "RETURN") {
        for (let i = 0; i < orders.length; i++) {
          let order = orders[i];
          let baseOrder = await Order.findOne({ where: { id: order.id } });
          let product = await Product.findOne({
            where: { id: order.productId },
          });
          orderModel = {
            saleInvoiceId: payload.invoiceId,
            productId: order.productId,
            pricePerUnit: order.pricePerUnit,
            buyingPricePerUnit: order.buyingPricePerUnit,
            quantityOrdered: baseOrder.quantityOrdered,
            packageQuantity: order.packageQuantity,
            looseQuantity: order.looseQuantity,
            quantityReturned: order.quantityReturned,
            quantityDelivered: 0,
            qunatityDeliveryPending: 0,
            totalPrice: order.totalOrderPrice,
            state: "RETURNED",
            deliveryStatus: "RECEIVED",
            tnxDate: new Date(),
            clientId: clientId,
          };
          let updatedProdutQuantity = product.quantity + order.quantityReturned;
          let updatedProdutReturnQuantity =
            product.quantityReturn + order.quantityReturned;
          let updatedProduct = await Product.update(
            {
              quantity: updatedProdutQuantity,
              quantityReturn: updatedProdutReturnQuantity,
            },
            { where: { id: product.id } }
          );
          let createdOrder = await Order.create(orderModel);
          // let updatedPendingQuantity = baseOrder.qunatityDeliveryPending - order.quantityReturned;
          // let updatedSupplyOrder = await Order.update({qunatityDeliveryPending:updatedPendingQuantity},{where:{id:order.id}});
        }
        // cus tnx

        custAccTnxModel = {
          transactionType: TransactionTypes.CREDIT,
          transactionReason: "Product_Return",
          transactionCategory: TRANSACTION_CATEGORY.PRODUCT_SALE_RETURN,
          amount: payload.totalSellPrice,
          transactionDate: tnxDate,
          approvedBy: payload.approveBy || "",
          issuedBy: payload.issuedBy,
          paymentMethod: "Inter_Transaction",
          refference: "Product_Return",
          accountNo: cusAcc.id,
          voucherNo: voucherNo.toString(),
          GL_TYPE: GL_TYPES.LIABILITY_GL,
          isDebit: false,
          isIncrease: true,
          clientId: clientId,
          transaction: t,
        };
        creditAmount += payload.totalSellPrice;
        let cusAccTnx = await transactionRepository.doTransaction(
          custAccTnxModel
        );

        prodAccTnxModel = {
          transactionType: TransactionTypes.DEBIT,
          transactionReason: "Stock_Returned",
          transactionCategory: TRANSACTION_CATEGORY.PRODUCT_SALE_RETURN,
          amount: payload.totalCostPrice,
          transactionDate: tnxDate,
          approvedBy: payload.approveBy,
          issuedBy: payload.issuedBy,
          paymentMethod: "Inter_Transaction",
          refference: "Product_Return On Invoice #" + invoice.invoiceNo,
          accountNo: productAcc.id,
          voucherNo: voucherNo.toString(),
          GL_TYPE: GL_TYPES.ASSET_GL,
          isDebit: true,
          isIncrease: true,
          clientId: clientId,
          transaction: t,
        };
        debitAmount += payload.totalCostPrice;
        let prodAccTnx = await transactionRepository.doTransaction(
          prodAccTnxModel
        );

        expenseAccTnxModel = {
          transactionType: TransactionTypes.DEBIT,
          transactionReason: "Stock_Returned",
          transactionCategory: TRANSACTION_CATEGORY.PRODUCT_SALE_RETURN,
          amount: payload.totalSellPrice - payload.totalCostPrice,
          transactionDate: tnxDate,
          approvedBy: payload.approveBy,
          issuedBy: payload.issuedBy,
          paymentMethod: "Inter_Transaction",
          refference: payload.comment,
          refference: "Product_Return On Invoice #" + invoice.invoiceNo,
          accountNo: expenseAcc.id,
          voucherNo: voucherNo.toString(),
          GL_TYPE: GL_TYPES.ASSET_GL,
          isDebit: true,
          isIncrease: true,
          clientId: clientId,
          transaction: t,
        };
        debitAmount += payload.totalSellPrice - payload.totalCostPrice;
        let expenseAccTnx = await transactionRepository.doTransaction(
          expenseAccTnxModel
        );
      } else if (payload.returnType == "DAMAGE") {
        for (let i = 0; i < orders.length; i++) {
          let order = orders[i];
          let baseOrder = await Order.findOne({ where: { id: order.id } });
          let product = await Product.findOne({
            where: { id: order.productId },
          });
          orderModel = {
            saleInvoiceId: payload.invoiceId,
            productId: order.productId,
            pricePerUnit: order.pricePerUnit,
            buyingPricePerUnit: order.buyingPricePerUnit,
            packageQuantity: order.packageQuantity,
            looseQuantity: order.looseQuantity,
            quantityOrdered: baseOrder.quantityOrdered,
            quantityReturned: order.quantityReturned,
            quantityDelivered: 0,
            qunatityDeliveryPending: 0,
            totalPrice: order.totalOrderPrice,
            state: "DAMAGED",
            deliveryStatus: "RECEIVED",
            tnxDate: new Date(),
            clientId: clientId,
          };

          // let updatedProdutQuantity = product.quantity + order.quantityReturned;
          let updatedProdutDamagedQuantity =
            product.quantityDamaged + order.quantityReturned;
          let updatedProduct = await Product.update(
            {
              quantityDamaged: updatedProdutReturnQuantity,
            },
            { where: { id: product.id } }
          );
          let createdOrder = await Order.create(orderModel);
        }
        // orders.forEach(async (order) => {

        // let updatedPendingQuantity = baseOrder.qunatityDeliveryPending - order.quantityReturned;
        // let updatedSupplyOrder = await Order.update({quantityReturned:updatedPendingQuantity},{where:{id:order.id}});
        // });

        // cus tnx
        custAccTnxModel = {
          transactionType: TransactionTypes.CREDIT,
          transactionReason: "Damaged_Product_Return",
          transactionCategory: TRANSACTION_CATEGORY.PRODUCT_SALE_RETURN,
          amount: payload.totalSellPrice,
          transactionDate: tnxDate,
          approvedBy: payload.approveBy,
          issuedBy: payload.issuedBy,
          paymentMethod: "Inter_Transaction",
          refference: "Damaged_Product_Return",
          accountNo: cusAcc.id,
          voucherNo: voucherNo.toString(),
          GL_TYPE: GL_TYPES.LIABILITY_GL,
          isDebit: false,
          isIncrease: true,
          clientId: clientId,
          transaction: t,
        };
        creditAmount += payload.totalSellPrice;
        let cusAccTnx = await transactionRepository.doTransaction(
          custAccTnxModel
        );

        expenseAccTnxModel = {
          transactionType: TransactionTypes.DEBIT,
          transactionReason: "Stock_Returned",
          transactionCategory: TRANSACTION_CATEGORY.PRODUCT_SALE_RETURN,
          amount: payload.totalSellPrice,
          transactionDate: tnxDate,
          approvedBy: payload.approveBy,
          issuedBy: payload.issuedBy,
          paymentMethod: "Inter_Transaction",
          refference: "Damaged_Product_Return On Invoice #" + invoice.invoiceNo,
          accountNo: expenseAcc.id,
          voucherNo: voucherNo.toString(),
          GL_TYPE: GL_TYPES.ASSET_GL,
          isDebit: true,
          isIncrease: true,
          clientId: clientId,
          transaction: t,
        };
        debitAmount += payload.totalSellPrice;
        let expenseAccTnx = await transactionRepository.doTransaction(
          expenseAccTnxModel
        );
      }

      if (debitAmount != creditAmount) {
        throw new Error("Debit Credit not same");
      }
    });
    let createdOrders = await Order.findAll({
      where: { saleInvoiceId: payload.invoiceId, clientId: clientId },
    });
    for (let i = 0; i < createdOrders.length; i++) {
      let order = createdOrders[i];
      if (!order.orderNo) {
        let orderNo = "OR-" + (order.id < 10 ? "0" + order.id : order.id);
        console.log(orderNo + " and ID " + order.id);
        let orderNoUpdated = await Order.update(
          { orderNo: orderNo },
          { where: { id: order.id } }
        );
      }
    }
    return "SUCCESS";
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
};

exports.returnSupplyOrder = async (req) => {
  let payload = req.body;
  let orders = payload.orders;
  let tnxDate = new Date();
  let voucherNo = tnxDate.getTime();
  let clientId;
  if (payload.clientId && payload.clientId != "") {
    clientId = payload.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  let suppAcc = await Account.findOne({
    where: { id: payload.suppAcc },
    include: GlAccount,
  });
  let productAcc = await Account.findOne({
    where: { accountType: ACCOUNT_TYPES.PRODUCT_GL, clientId: clientId },
    include: GlAccount,
  });
  let suppAccTnxModel = {};
  let prodAccTnxModel = {};
  let debitAmount = 0;
  let creditAmount = 0;

  try {
    for (let i = 0; i < orders.length; i++) {
      let order = orders[i];
      let baseOrder = await SupplyOrder.findOne({ where: { id: order.id } });
      orderModel = {
        supplyInvoiceId: payload.invoiceId,
        productId: order.productId,
        pricePerUnit: order.buyingPricePerUnit,
        packageQuantity: order.packageQuantity,
        looseQuantity: order.looseQuantity,
        quantityOrdered: baseOrder.quantityOrdered,
        quantityReturned: order.quantityReturned,
        quantityDelivered: 0,
        qunatityDeliveryPending: 0,
        totalPrice: order.totalOrderPrice,
        state: payload.returnType,
        deliveryStatus: "RETURNED",
        tnxDate: new Date(),
        clientId: clientId,
      };
      let product = await Product.findOne({ where: { id: order.productId } });
      let updatedProdutQuantity = product.quantity - order.quantityReturned;
      let updatedProduct = await Product.update(
        {
          quantity: updatedProdutQuantity,
        },
        { where: { id: product.id } }
      );
      let createdOrder = await SupplyOrder.create(orderModel);
    }
    // orders.forEach(async (order) => {

    //   // let updatedPendingQuantity = baseOrder.qunatityDeliveryPending - order.quantityReturned;
    //   // let updatedSupplyOrder = await SupplyOrder.update({qunatityDeliveryPending:updatedPendingQuantity},{where:{id:order.id}});
    // });
    // supplier tnx

    const result = await db.sequelize.transaction(async (t) => {
      suppAccTnxModel = {
        transactionType: TransactionTypes.DEBIT,
        transactionReason: "Product_Return",
        transactionCategory: TRANSACTION_CATEGORY.PRODUCT_PURCHASE_RETURN,
        amount: payload.totalCostPrice,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: "Inter_Transaction",
        refference: "Product_Return",
        accountNo: suppAcc.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.ASSET_GL,
        isDebit: true,
        isIncrease: true,
        clientId: clientId,
        transaction: t,
      };
      debitAmount += payload.totalCostPrice;
      let suppAccTnx = await transactionRepository.doTransaction(
        suppAccTnxModel
      );
      // product Transaction
      prodAccTnxModel = {
        transactionType: TransactionTypes.CREDIT,
        transactionReason: "Supply_Returned",
        transactionCategory: TRANSACTION_CATEGORY.PRODUCT_PURCHASE_RETURN,
        amount: payload.totalCostPrice,
        transactionDate: tnxDate,
        approvedBy: payload.approveBy,
        issuedBy: payload.issuedBy,
        paymentMethod: "Inter_Transaction",
        refference: "Product_Return",
        accountNo: productAcc.id,
        voucherNo: voucherNo.toString(),
        GL_TYPE: GL_TYPES.ASSET_GL,
        isDebit: false,
        isIncrease: false,
        clientId: clientId,
        transaction: t,
      };
      creditAmount += payload.totalCostPrice;
      let prodAccTnx = await transactionRepository.doTransaction(
        prodAccTnxModel
      );
    });
    // account balance update
    let createdOrders = await SupplyOrder.findAll({
      where: { supplyInvoiceId: payload.invoiceId, clientId: clientId },
    });
    for (let i = 0; i < createdOrders.length; i++) {
      let order = createdOrders[i];
      if (!order.orderNo) {
        let orderNo = "SOR-" + (order.id < 10 ? "0" + order.id : order.id);
        let orderNoUpdated = await SupplyOrder.update(
          { orderNo: orderNo },
          { where: { id: order.id, clientId: clientId } }
        );
      }
    }
    if (debitAmount != creditAmount) {
      throw new Error("Debit Credit not same");
    }
    return "SUCCESS";
  } catch (error) {
    throw new Error(error.message);
  }
};

async function checkandUpdateOrderNo(orders) {
  for (let i = 0; i < orders.length; i++) {
    let order = orders[i];
    if (order.orderNo == null) {
      let orderNo = "";
      if (order.state == "SOLD") {
        orderNo = "O-" + (order.id < 10 ? "0" + order.id : order.id);
      } else {
        orderNo = "OR-" + (order.id < 10 ? "0" + order.id : order.id);
      }

      let orderNoUpdated = await Order.update(
        { orderNo: orderNo },
        { where: { id: order.id } }
      );
    }
  }
}

// to delete
async function fixproductStock() {
  let orders = await Order.findAll();
  let supplyOrder = await SupplyOrder.findAll();
  // for(let i=0;i<supplyOrder.length;i++){
  //   let order = supplyOrder[i];
  //   let baseProduct = await Product.findOne({where:{id:order.productId}});
  //   let updatedQuantity = baseProduct.quantity + order.quantityDelivered;
  //   let updatedProduct = await Product.update({quantity:updatedQuantity},{where:{id:order.productId}});
  // }

  // for(let i=0;i<orders.length;i++){
  //   let order = orders[i];
  //   let baseProduct = await Product.findOne({where:{id:order.productId}});
  //   let updatedSoldQuantity= 0;
  //   let updatedReturnQuantity = 0;
  //   let updatedQuantity = 0;
  //   if(order.state== "SOLD"){
  //     updatedSoldQuantity = baseProduct.quantitySold + order.quantityOrdered;
  //     updatedQuantity = baseProduct.quantity - order.quantityDelivered;
  //   }else{
  //     updatedQuantity = baseProduct.quantity + order.quantityDelivered;
  //     updatedReturnQuantity = baseProduct.quantityReturn + order.quantityReturned;
  //   }
  //   let updatedProduct = await Product.update({quantity:updatedQuantity,quantitySold:updatedSoldQuantity,quantityReturn:updatedReturnQuantity},{where:{id:order.productId}});
  // }
  return 0;
}

async function taskIsLocked(taskId) {
  let task = await ApprovalFlow.findOne({ where: { id: taskId } });
  if (task !== null && task.state == "OPEN") {
    let updatedTaskState = await ApprovalFlow.update(
      { state: "LOCKED" },
      { where: { id: taskId } }
    );
    return false;
  } else if (task.state == "LOCKED") {
    return true;
  }
}
