const AccountHistory = require("../model/accountHistory");
const Customer = require("../model/customer");
const Order = require("../model/order");
const Product = require("../model/product");
const ProductCategory = require("../model/productCategory");
const SaleInvoice = require("../model/saleInvoice");
const Supplyer = require("../model/supplyer");
const SupplyInvoice = require("../model/supplyInvoice");
const SupplyOrder = require("../model/supplyOrder");
const User = require("../model/user");
const reportRepo = require("../repository/report-repo");
const db = require("../connector/db-connector");
const { Op } = require("sequelize");

exports.getAccountHistoryByAccountId = async (req) => {
  let query = req.query;
  try {
    let history = await AccountHistory.findAll({
      where: { id: query.accountId },
    });
    return history;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getAccountHistoryRecord = async (req) => {
  let query = {};
  try {
    if (req.query.tnxType && req.query.tnxType != "") {
      query.tnxType = req.query.tnxType;
    }

    let historyList = await AccountHistory.findAll({ where: query });
    return historyList;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getSaleOrderReport = async (req) => {
  let params = req.query;
  let query = {};
  let offsets = Number(params.offset);
  let limit = Number(params.limit);
  let length = 0;
  let fromDate = new Date("2023-01-01");
  let toDate = new Date();
  toDate.setDate(toDate.getDate() + 1);
  if (params.clientId && params.clientId != "") {
    query.clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    if (params.deliveryStatus && params.deliveryStatus != "") {
      query.deliveryStatus = params.deliveryStatus;
    }
    if (params.invoiceNo && params.invoiceNo != "") {
      let invoice = await SaleInvoice.findOne({
        where: { invoiceNo: params.invoiceNo },
      });
      if (invoice) {
        query.saleInvoiceId = invoice.id;
      }
    }
    if (params.orderNo && params.orderNo != "") {
      query.orderNo = params.orderNo;
    }

    if (params.productCode && params.productCode != "") {
      let product = await Product.findOne({
        where: { productCode: params.productCode },
      });
      query.productId = product.id;
    }
    if (params.fromDate && params.fromDate != "") {
      fromDate = new Date(params.fromDate);
    }
    if (params.toDate && params.toDate != "") {
      toDate = new Date(params.toDate);
    }
    query.tnxDate = { [Op.between]: [fromDate, toDate] };
    orderList = await Order.findAll({
      where: query,
      offset: offsets,
      limit: limit,
      include: [SaleInvoice, Product],
    });
    let productList = await Product.findAll({
      include: [{ model: Order, where: query }],
    });
    length = await Order.count({ where: query });
    return { data: productList, length: length };
  } catch (error) {
    throw new Error(error.message);
  }
};
exports.getSupplyOrderReport = async (req) => {
  let params = req.query;
  let query = {};
  let orderList = [];
  let offsets = Number(params.offset);
  let limit = Number(params.limit);
  let length = 0;
  let fromDate = new Date("2023-01-01");
  let toDate = new Date();
  toDate.setDate(toDate.getDate() + 1);
  if (params.clientId && params.clientId != "") {
    query.clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    if (params.deliveryStatus && params.deliveryStatus != "") {
      query.deliveryStatus = params.deliveryStatus;
    }
    if (params.orderNo && params.orderNo != "") {
      query.orderNo = params.orderNo;
    }
    if (params.invoiceNo && params.invoiceNo != "") {
      let invoice = await SupplyInvoice.findOne({
        where: { invoiceNo: params.invoiceNo },
      });
      if (invoice) {
        query.supplyInvoiceId = invoice.id;
      }
    }
    if (params.productCode && params.productCode != "") {
      let product = await Product.findOne({
        where: { productCode: params.productCode },
      });
      query.productId = product.id;
    }
    if (params.fromDate && params.fromDate != "") {
      fromDate = new Date(params.fromDate);
    }
    if (params.toDate && params.toDate != "") {
      toDate = new Date(params.toDate);
    }
    query.tnxDate = { [Op.between]: [fromDate, toDate] };
    orderList = await SupplyOrder.findAll({
      where: query,
      offset: offsets,
      limit: limit,
      include: [SupplyInvoice, Product],
    });
    length = await SupplyOrder.count({ where: query });
    return { data: orderList, length: length };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getOverallSummary = async (req) => {
  let params = req.query;
  try {
    let summary = await reportRepo.getDashboardSummary(params);
    return summary;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getStockReport = async (req) => {
  let params = req.query;
  let query = {};
  let stockList = [];
  let offsets = Number(params.offset);
  let limit = Number(params.limit);
  let length = 0;
  if (params.clientId && params.clientId != "") {
    query.clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    stockList = await Product.findAll({
      where: query,
      include: [SupplyOrder, Order],
    });
    length = await Product.count({ where: query });
    return { data: stockList, length: length };
  } catch (error) {
    throw new Error(error.message);
  }
};
exports.getEntitySummary = async (req) => {
  let params = req.query;
  let summary = {};
  let clientId;
  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    let totalProduct = await Product.count({where:{clientId:clientId}});
    let totalProductCategory = await ProductCategory.count({where:{clientId:clientId}});
    let totalCustomer = await Customer.count({where:{clientId:clientId}});
    let totalSupplier = await Supplyer.count({where:{clientId:clientId}});
    let totalManager = await User.count({ where: { userRole: "MANAGER",clientId:clientId } });
    let totalHr = await User.count({ where: { userRole: "SALER",clientId:clientId } });
    return {
      totalProduct: totalProduct,
      totalProductCategory: totalProductCategory,
      totalCustomer: totalCustomer,
      totalSupplier: totalSupplier,
      totalManager: totalManager,
      totalHr: totalHr,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
exports.getProfitReport = async (req) => {
  let params = req.query;
  let offsets = Number(params.offset);
  let limit = Number(params.limit);
  let query = {};
  let totalSellingPrice = 0;
  let totalDiscountAndExtraChrge = 0;
  let fromDate = new Date("2023-01-01");
  let toDate = new Date();
  toDate.setDate(toDate.getDate() + 1);
  let clientId;
  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
    query.clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    if (params.invoiceNo && params.invoiceNo != "") {
      let invoice = await SaleInvoice.findOne({
        where: { invoiceNo: params.invoiceNo,clientId:clientId },
      });
      query.id = invoice.id;
    }
    if (params.fromDate && params.fromDate != "") {
      fromDate = new Date(params.fromDate);
    }
    if (params.toDate && params.toDate != "") {
      toDate = new Date(params.toDate);
    }
    query.purchaseDate = { [Op.between]: [fromDate, toDate] };
    totalSellingPrice = await Order.findAll({
      where:{clientId:clientId},
      attributes: [
        [
          db.sequelize.fn(
            "sum",
            db.sequelize.literal("(quantityOrdered*pricePerUnit)")
          ),
          "totalSaleAmount",
        ],
      ],
    });
    totalBuyingPrice = await Order.findAll({
      where:{clientId:clientId},
      attributes: [
        [
          db.sequelize.fn(
            "sum",
            db.sequelize.literal("(quantityOrdered*buyingPricePerUnit)")
          ),
          "totalBuyingPrice",
        ],
      ],
    });
    totalDiscountAndExtraChrge = await SaleInvoice.findAll({
      where:{clientId:clientId},
      attributes: [
        [
          db.sequelize.fn("sum", db.sequelize.col("rebate")),
          "totalDiscountGiven",
        ],
        [
          db.sequelize.fn("sum", db.sequelize.col("extraCharge")),
          "totalExtraChargeTaken",
        ],
      ],
    });
    let invoices = await SaleInvoice.findAll({
      // offset: offsets,
      // limit: limit,
      where: query,
      include: Order,
    });
    let invoiceList = [];
    invoices.forEach((invoice) => {
      let orders = invoice.orders;
      let income = 0;
      orders.forEach((order) => {
        income +=
          (order.pricePerUnit - order.buyingPricePerUnit) *
          (order.quantityOrdered - (order.quantityReturned || 0));
      });
      let profitModel = {
        invoiceNo: invoice.invoiceNo,
        profitFromSale: +Number(income).toFixed(2),
        discount: +Number(invoice.rebate).toFixed(2),
        extraCharge: +Number(invoice.extraCharge).toFixed(2),
        date: invoice.purchaseDate,
      };
      invoiceList.push(profitModel);
    });

    return {
      invoiceList: invoiceList,
      totalSellingPrice: +Number(
        totalSellingPrice[0].dataValues.totalSaleAmount
      ).toFixed(2),
      totalBuyingPrice: +Number(
        totalBuyingPrice[0].dataValues.totalBuyingPrice
      ).toFixed(2),
      totalDiscountGiven: +Number(
        totalDiscountAndExtraChrge[0].dataValues.totalDiscountGiven
      ).toFixed(2),
      totalExtraChargeTaken: +Number(
        totalDiscountAndExtraChrge[0].dataValues.totalExtraChargeTaken
      ).toFixed(2),
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
exports.getVisualSummary = async (req) => {
  let params = req.query;
  let orders = [];
  let purchase;
  let clientId;
  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    let monthlyOrder = {
      jan: 0,
      feb: 0,
      mar: 0,
      apr: 0,
      may: 0,
      jun: 0,
      jul: 0,
      aug: 0,
      sep: 0,
      oct: 0,
      nov: 0,
      dec: 0,
    };
    let monthlyPurchase = {
      jan: 0,
      feb: 0,
      mar: 0,
      apr: 0,
      may: 0,
      jun: 0,
      jul: 0,
      aug: 0,
      sep: 0,
      oct: 0,
      nov: 0,
      dec: 0,
    };
    let orderCount = {
      jan: 0,
      feb: 0,
      mar: 0,
      apr: 0,
      may: 0,
      jun: 0,
      jul: 0,
      aug: 0,
      sep: 0,
      oct: 0,
      nov: 0,
      dec: 0,
    };
    let orderList = await Order.findAll({where:{clientId:clientId}});
    orderList.forEach((order) => {
      let date = new Date(order.tnxDate);
      switch (date.getMonth()) {
        case 0:
          monthlyOrder.jan += order.totalPrice;
          orderCount.jan++;
          break;
        case 1:
          monthlyOrder.feb += order.totalPrice;
          orderCount.feb++;
          break;
        case 2:
          monthlyOrder.mar += order.totalPrice;
          orderCount.mar++;
          break;
        case 3:
          monthlyOrder.apr += order.totalPrice;
          orderCount.apr++;
          break;
        case 4:
          monthlyOrder.may += order.totalPrice;
          orderCount.may++;
          break;
        case 5:
          monthlyOrder.jun += order.totalPrice;
          orderCount.jun++;
          break;
        case 6:
          monthlyOrder.jul += order.totalPrice;
          orderCount.jul++;
          break;
        case 7:
          monthlyOrder.aug += order.totalPrice;
          orderCount.aug++;
          break;
        case 8:
          monthlyOrder.sep += order.totalPrice;
          orderCount.sep++;
          break;
        case 9:
          monthlyOrder.oct += order.totalPrice;
          orderCount.oct++;
          break;
        case 10:
          monthlyOrder.nov += order.totalPrice;
          orderCount.nov++;
          break;
        case 11:
          monthlyOrder.dec += order.totalPrice;
          orderCount.dec++;
          break;
        default:
          break;
      }
    });
    let purchaseList = await SupplyOrder.findAll({where:{clientId:clientId}});
    purchaseList.forEach((order) => {
      let date = new Date(order.tnxDate);
      switch (date.getMonth()) {
        case 0:
          monthlyPurchase.jan += order.totalPrice;
          break;
        case 1:
          monthlyPurchase.feb += order.totalPrice;
          break;
        case 2:
          monthlyPurchase.mar += order.totalPrice;
          break;
        case 3:
          monthlyPurchase.apr += order.totalPrice;
          break;
        case 4:
          monthlyPurchase.may += order.totalPrice;
          break;
        case 5:
          monthlyPurchase.jun += order.totalPrice;
          break;
        case 6:
          monthlyPurchase.jul += order.totalPrice;
          break;
        case 7:
          monthlyPurchase.aug += order.totalPrice;
          break;
        case 8:
          monthlyPurchase.sep += order.totalPrice;
          break;
        case 9:
          monthlyPurchase.oct += order.totalPrice;
          break;
        case 10:
          monthlyPurchase.nov += order.totalPrice;
          break;
        case 11:
          monthlyPurchase.dec += order.totalPrice;
          break;
        default:
          break;
      }
    });

    return {
      sale: monthlyOrder,
      purchase: monthlyPurchase,
      orderCount: orderCount,
    };
  } catch (error) {
    throw new Error("Report Fetching Failed " + error.message);
  }
};

exports.getStockSaleReport = async (req) => {
  let params = req.query;
  let query = {};
  let orderQuery = {};
  let productList = [];
  let offsets = Number(params.offset);
  let limit = Number(params.limit);
  let length = 0;
  let fromDate = new Date("2023-01-01");
  let toDate = new Date();
  toDate.setDate(toDate.getDate() + 1);
  if (params.clientId && params.clientId != "") {
    query.clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    if (params.invoiceNo && params.invoiceNo != "") {
      let invoice = await SaleInvoice.findOne({
        where: { invoiceNo: params.invoiceNo,clientId:params.clientId},
      });
      if (invoice) {
        orderQuery.saleInvoiceId = invoice.id;
      }
    }
    if (params.productCode && params.productCode != "") {
      let product = await Product.findOne({
        where: { productCode: params.productCode, clientId:params.clientId },
      });
      query.id = product.id;
    }
    if (params.fromDate && params.fromDate != "") {
      fromDate = new Date(params.fromDate);
    }
    if (params.toDate && params.toDate != "") {
      toDate = new Date(params.toDate);
    }
    orderQuery.tnxDate = { [Op.between]: [fromDate, toDate] };
    productList = await Product.findAll({
      offset: offsets,
      limit: limit,
      where: query,
      include: [{ model: Order, where: orderQuery }],
    });
    length = await Product.count({ where: query });
    let productsReport = await prepareStockSaleReport(productList);
    return { data: productsReport, length: length };
  } catch (error) {
    throw new Error(error.message);
  }
};
exports.getStockSupplyReport = async (req) => {
  let params = req.query;
  let query = {};
  let orderQuery = {};
  let productList = [];
  let offsets = Number(params.offset);
  let limit = Number(params.limit);
  let length = 0;
  let fromDate = new Date("2023-01-01");
  let toDate = new Date();
  toDate.setDate(toDate.getDate() + 1);
  if (params.clientId && params.clientId != "") {
    query.clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    if (params.invoiceNo && params.invoiceNo != "") {
      let invoice = await SupplyInvoice.findOne({
        where: { invoiceNo: params.invoiceNo,clientId:params.clientId },
      });
      if (invoice) {
        orderQuery.supplyInvoiceId = invoice.id;
      }
    }
    if (params.productCode && params.productCode != "") {
      let product = await Product.findOne({
        where: { productCode: params.productCode,clientId:params.clientId },
      });
      query.id = product.id;
    }
    if (params.fromDate && params.fromDate != "") {
      fromDate = new Date(params.fromDate);
    }
    if (params.toDate && params.toDate != "") {
      toDate = new Date(params.toDate);
    }
    orderQuery.tnxDate = { [Op.between]: [fromDate, toDate] };
    productList = await Product.findAll({
      offset: offsets,
      limit: limit,
      where: query,
      include: [{ model: SupplyOrder, where: orderQuery }],
    });
    length = await Product.count({ where: query });
    let productsReport = await prepareStockSupplyReport(productList);
    return { data: productsReport, length: length };
  } catch (error) {
    throw new Error(error.message);
  }
};

async function prepareStockSaleReport(products) {
  let productsReport = [];
  try {
    products.map(async (prod) => {
      let product = {
        productCode: prod.productCode,
        productName: prod.productName,
        stockQuantity: prod.quantity,
        quantityOrdered: 0,
        quantityDelivered: 0,
        quantityPending: 0,
        quantityReturned: 0,
        quantityDamaged: prod.quantityDamaged,
      };
      prod.orders.map(async (order) => {
        product.quantityOrdered += order.quantityOrdered || 0;
        product.quantityDelivered += order.quantityDelivered || 0;
        product.quantityPending += order.qunatityDeliveryPending || 0;
        product.quantityReturned += order.quantityReturned || 0;
        // product.quantityDamaged+=order.qunatityDeliveryPending;
      });
      productsReport.push(product);
    });
    return productsReport;
  } catch (error) {
    throw new Error(error.message);
  }
}
async function prepareStockSupplyReport(products) {
  let productsReport = [];
  try {
    products.map(async (prod) => {
      let product = {
        productCode: prod.productCode,
        productName: prod.productName,
        stockQuantity: prod.quantity,
        quantityOrdered: 0,
        quantityDelivered: 0,
        quantityPending: 0,
        quantityReturned: 0,
        quantityDamaged: prod.quantityDamaged,
      };
      prod.supplyOrders.map(async (order) => {
        product.quantityOrdered += order.quantityOrdered || 0;
        product.quantityDelivered += order.quantityDelivered || 0;
        product.quantityPending += order.qunatityDeliveryPending || 0;
        product.quantityReturned += order.quantityReturned || 0;
        // product.quantityDamaged+=order.qunatityDeliveryPending;
      });
      productsReport.push(product);
    });
    return productsReport;
  } catch (error) {
    throw new Error(error.message);
  }
}
