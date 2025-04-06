const { Op } = require("sequelize");
const db = require("../connector/db-connector");
const Account = require("../model/account");
const Customer = require("../model/customer");
const Order = require("../model/order");
const SaleInvoice = require("../model/saleInvoice");
const Supplyer = require("../model/supplyer");
const SupplyInvoice = require("../model/supplyInvoice");
const SupplyOrder = require("../model/supplyOrder");
const TransactionRegistry = require("../model/transactionRegistry");
exports.getDashboardSummary = async (params) => {
  let toDay = new Date();
  let dashboardSummary = {
    todaysTotalSale: 0,
    totalSale: 0,
    todaysTotalPurchase: 0,
    totalPurchase: 0,
    todaysProfitFromSale: 0,
    totalProfitFromSale: 0,
    totalDiscountGiven: 0,
    todaysDiscountGiven: 0,
    totalDiscountTaken: 0,
    todaysDiscountTaken: 0,
    todaysExtraCharge: 0,
    totalExtraCharge: 0,
    todaysExpense: 0,
    totalExpense: 0,
  };
  let clientId;
  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    let orders = await Order.findAll({where:{clientId:clientId}});
    let supplies = await SupplyOrder.findAll({where:{clientId:clientId}});
    let salesInvoice = await SaleInvoice.findAll({where:{clientId:clientId},include: Order});
    let suppliesInvoice = await SupplyInvoice.findAll({where:{clientId:clientId},include: SupplyOrder });
    let saleOrderSummary = await getTotalFromOrder(orders);
    let supplyOrderSummary = await getTotalFromOrder(supplies);
    let saleProfitSumamry = await getProfitSummary(salesInvoice);
    let saleInvoiceSummary = await discountAndExtraCharge(salesInvoice);
    let supplySumamry = await getSupplySummary(suppliesInvoice);
    let customers = await Customer.findAll({where:{clientId:clientId},include: Account});
    let suppliers = await Supplyer.findAll({where:{clientId:clientId},include: Account});
    let customerBalanceSummary = await getBalanceSummary(customers);
    let supplierBalanceSummary = await getBalanceSummary(suppliers);
    let totalExpense = await getExpenseSum("2023-01-01");
    let todaysExpense = await getExpenseSum(toDay);
    return {
      todaysTotalSale: saleOrderSummary.todaysTotal,
      totalSale: saleOrderSummary.subTotal,
      todaysTotalPurchase: supplyOrderSummary.todaysTotal,
      totalPurchase: supplyOrderSummary.subTotal,
      todaysProfitFromSale: 0,
      totalProfitFromSale: 0,
      totalDiscountGiven: saleInvoiceSummary.totalDiscount,
      todaysDiscountGiven: saleInvoiceSummary.todaysDiscount,
      todaysExtraCharge: saleInvoiceSummary.todaysExtraCharge,
      totalExtraCharge: saleInvoiceSummary.totalExtraCharge,
      saleProfitSumamry: saleProfitSumamry,
      customerBalanceSummary: customerBalanceSummary,
      supplierBalanceSummary: supplierBalanceSummary,
      supplySumamry: supplySumamry,
      totalExpense:totalExpense,
      todaysExpense:todaysExpense

    };
  } catch (error) {
    throw new Error(error);
  }
};

async function getTotalFromOrder(orders) {
  let todaysTotal = 0;
  let subTotal = 0;
  let totalReturn = 0;
  let date = new Date();
  let today =
    date.getFullYear() +
    "-" +
    (date.getMonth() <= 9 ? "0" : "") +
    (date.getMonth() + 1) +
    "-" +
    (date.getDate() <= 9 ? "0" : "") +
    date.getDate();
  await orders.map((elem) => {
    if (elem.state == "SOLD" || elem.state == 'PURCHASED') {
      if (today == elem.tnxDate) {
        todaysTotal += elem.totalPrice;
      }
      subTotal += elem.totalPrice;
    }
  });
  return { todaysTotal: todaysTotal, subTotal: subTotal };
}

async function getProfitSummary(invoiceList) {
  let totalCost = 0;
  let todaysTotalCost = 0;
  let totalDiscount = 0;
  let totalSale = 0;
  let date = new Date();
  let today =
    date.getFullYear() +
    "-" +
    (date.getMonth() <= 9 ? "0" : "") +
    (date.getMonth() + 1) +
    "-" +
    (date.getDate() <= 9 ? "0" : "") +
    date.getDate();
  for(let i=0;i<invoiceList.length;i++){
    let invoice = invoiceList[i];
    let orders = invoice.orders;
    try {
      totalSale += invoice.totalPayableAmount;
      let totalCostPerInvoice = 0;
      let totalTodaysCostPerInvoice = 0;
      if(orders && orders.length>0){
        for(let j=0;j<orders.length;j++){
          let order = orders[j];
          if (today == order.tnxDate) {
            totalTodaysCostPerInvoice +=
              order.buyingPricePerUnit * order.quantityOrdered;
          }
          totalCostPerInvoice += order.buyingPricePerUnit * order.quantityOrdered;
        }
      }
      
      totalCost += totalCostPerInvoice;
      todaysTotalCost += totalTodaysCostPerInvoice;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  return {
    todaysTotalCost: todaysTotalCost,
    totalCost: totalCost
  };
}

async function getBalanceSummary(clientList) {
  let totalDueAmount = 0;
  let totalOwedAmount = 0;
  clientList.forEach((client) => {
    let balance = client.account.balance;
    if (balance < 0) {
      totalDueAmount += balance;
    } else {
      totalOwedAmount += balance;
    }
  });
  return {
    totalDueAmount: Math.abs(totalDueAmount),
    totalOwedAmount: totalOwedAmount,
  };
}

async function getSupplySummary(invoiceList) {
  let date = new Date();
  let today =
    date.getFullYear() +
    "-" +
    (date.getMonth() <= 9 ? "0" : "") +
    (date.getMonth() + 1) +
    "-" +
    (date.getDate() <= 9 ? "0" : "") +
    date.getDate();
  let todaysDiscount = 0;
  let totalDiscount = 0;
  await invoiceList.forEach(async (invoice) => {
    try {
      if (today == invoice.purchaseDate) {
        todaysDiscount += Number(invoice.rebate);
      }
      totalDiscount += invoice.rebate;
    } catch (error) {
      throw new Error(error.message);
    }
  });
  return { todaysDiscountReceived: todaysDiscount,totalDiscountReceived: totalDiscount };
}
async function discountAndExtraCharge(invoices){
  let date = new Date();
  let today =
    date.getFullYear() +
    "-" +
    (date.getMonth() <= 9 ? "0" : "") +
    (date.getMonth() + 1) +
    "-" +
    (date.getDate() <= 9 ? "0" : "") +
    date.getDate();
  let todaysDiscount = 0;
  let todaysExtraCharge = 0;
  let totalDiscount = 0;
  let totalExtraCharge = 0;
  try {
    await invoices.forEach((invoice) => {
      if (today == invoice.purchaseDate) {
        todaysDiscount += Number(invoice.rebate);
        todaysExtraCharge += Number(invoice.extraCharge);
      }
      totalDiscount += Number(invoice.rebate);
      totalExtraCharge += Number(invoice.extraCharge);
    });
    return {
      todaysDiscount: todaysDiscount,
      totalDiscount: totalDiscount,
      todaysExtraCharge: todaysExtraCharge,
      totalExtraCharge: totalExtraCharge,
    };
  } catch (error) {
    throw new Error(error.message);
  }
}


exports.getProfitSummary = async (invoice) => {
  let totalSal;
};
async function getExpenseSum(payload) {
  let toDate = new Date();
  let fromDate = new Date(payload);
  toDate.setDate(toDate.getDate() + 1);
  try {
    let total = await TransactionRegistry.findAll({
      attributes:["amount",[db.sequelize.fn('sum', db.sequelize.col('amount')), 'amount']],
      where: {
        transactionType:"DEBIT",
        transactionCategory: "EXPENSE",
        transactionDate :{[Op.between]: [fromDate, toDate]}
      }
    });
    return total[0].amount;
  } catch (error) {
    throw new Error(error.message);
  }
}