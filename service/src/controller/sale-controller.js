const saleService = require("../service/sale-service");

exports.issueSaleOrders = async (req, res, next) => {
  try {
    let orderRes = await saleService.issueSaleOrder(req);
    return res.status(200).json(orderRes);
  } catch (error) {
    return res.status(401).json({
      message: "order issued failed  " + error.message,
    });
  }
};
exports.cancelSaleOrder = async (req, res, next) => {
  try {
    let orderRes = await saleService.cancelSaleOrder(req);
    return res.status(200).json({
      message: "order cancelled successfully",
      body: orderRes,
    });
  } catch (error) {
    return res.status(401).json({
      message: "order issued failed  " + error.message,
    });
  }
};

exports.getSaleOrderList = async (req, res, next) => {
  try {
    let saleInvoiceList = await saleService.getSaleOrderList(req);
    return res.status(200).json({
      message: "Invoice Fetched successfully",
      body: saleInvoiceList,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invoice Fetched failed  " + error.message,
    });
  }
};
exports.getSaleOrderById = async (req, res, next) => {
  try {
    let saleInvoice = await saleService.getSaleOrderById(req);
    return res.status(200).json({
      message: "Invoice Fetched successfully",
      body: saleInvoice,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invoice Fetched failed  " + error.message,
    });
  }
};
exports.doPayment = async (req, res, next) => {
  try {
    // let transaction = await saleService.doPayment(req);
    return res.status(200).json({
      message: "Payment Successfull",
      // body: transaction,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Payment failed  " + error.message,
    });
  }
};

exports.updateSaleOrder = async (req, res, next) => {
  try {
    let orderRes = await saleService.updateSaleOrder(req);
    return res.status(200).json({
      message: "order updated successfully",
      body: orderRes,
    });
  } catch (error) {
    return res.status(401).json({
      message: "order updated failed  " + error.message,
    });
  }
};

exports.doSaleOrderReturn = async (req, res, next) => {
  try {
    let orderRes = await saleService.returnSaleOrder(req);
    return res.status(200).json({
      message: "order updated successfully",
      body: orderRes,
    });
  } catch (error) {
    return res.status(401).json({
      message: "order updated failed  " + error.message,
    });
  }
};
exports.doSupplyOrderReturn = async (req, res, next) => {
  try {
    let orderRes = await saleService.returnSupplyOrder(req);
    return res.status(200).json({
      message: "order updated successfully",
      body: orderRes,
    });
  } catch (error) {
    return res.status(401).json({
      message: "order updated failed  " + error.message,
    });
  }
};
