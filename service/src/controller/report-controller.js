const reportService = require("../service/report-service")
exports.getAccountHistoryByAccountId = async (req,res,next) => {
try {
    let history = await reportService.getAccountHistoryByAccountId(req);
    return res.status(200).json({
        message: "History Fetched",
        body: history
      });
} catch (error) {
    return res.status(400).json({
        message: error.message,
      });
}
}

exports.getAccountHistoryRecord = async(req,res,next) =>{
  try {
    let historyList = await reportService.getAccountHistoryRecord(req);
    return res.status(200).json({
        message: "History Fetched",
        body: historyList
      });
} catch (error) {
    return res.status(400).json({
        message: error.message,
      });
}
}

exports.getSaleOrderRecord = async(req,res,next) =>{
  try {
    let orderList = await reportService.getSaleOrderReport(req);
    return res.status(200).json({
        isSuccess:true,
        message: "Order List Fetched",
        body: orderList
      });
} catch (error) {
    return res.status(400).json({
        isSuccess:true,
        message: error.message,
      });
}
}

exports.getSupplyOrderRecord = async(req,res,next) =>{
  try {
    let responseData = await reportService.getSupplyOrderReport(req);
    return res.status(200).json({
        isSuccess:true,
        message: "Order List Fetched",
        body: responseData
      });
} catch (error) {
    return res.status(400).json({
        isSuccess:false,
        message: error.message,
      });
}
}

exports.getDashboardSummary = async(req,res,next)=>{
  try {
    let response = await reportService.getOverallSummary(req);
    return res.status(200).json({
      isSuccess:true,
      message: "Report Fetched",
      body: response
    });
  } catch (error) {
    return res.status(400).json({
      isSuccess:false,
      message: error.message,
    });   
  }
}

exports.getStockReport = async(req,res,next)=>{
  try {
    let response = await reportService.getStockReport(req);
    return res.status(200).json({
      isSuccess:true,
      message: "Report Fetched",
      body: response
    });
  } catch (error) {
    return res.status(400).json({
      isSuccess:false,
      message: error.message,
    });   
  }
}

exports.getEntitySummary = async(req,res,next)=>{
  try {
    let response = await reportService.getEntitySummary(req);
    return res.status(200).json({
      isSuccess:true,
      message: "Report Fetched",
      body: response
    });
  } catch (error) {
    return res.status(400).json({
      isSuccess:false,
      message: error.message,
    });   
  }
}

exports.getProfitReport = async(req,res,next)=>{
  try {
    let response = await reportService.getProfitReport(req);
    return res.status(200).json({
      isSuccess:true,
      message: "Report Fetched",
      body: response
    });
  } catch (error) {
    return res.status(400).json({
      isSuccess:false,
      message: error.message,
    });   
  }
}
exports.getVisualSummary = async(req,res,next)=>{
  try {
    let response = await reportService.getVisualSummary(req);
    return res.status(200).json({
      isSuccess:true,
      message: "Report Fetched",
      body: response
    });
  } catch (error) {
    return res.status(400).json({
      isSuccess:false,
      message: error.message,
    });   
  }
}

exports.getStockSaleRecord = async(req,res,next) =>{
  try {
    let orderList = await reportService.getStockSaleReport(req);
    return res.status(200).json({
        isSuccess:true,
        message: "Order List Fetched",
        body: orderList
      });
} catch (error) {
    return res.status(400).json({
        isSuccess:true,
        message: error.message,
      });
}
}

exports.getStockSupplyRecord = async(req,res,next) =>{
  try {
    let orderList = await reportService.getStockSupplyReport(req);
    return res.status(200).json({
        isSuccess:true,
        message: "Report List Fetched",
        body: orderList
      });
} catch (error) {
    return res.status(400).json({
        isSuccess:true,
        message: error.message,
      });
}
}