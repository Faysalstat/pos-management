const saleService = require ("../service/sale-service");

exports.issueSupplyOrder = async (req,res,next) => {
try {
    let orderRes = await saleService.issueSupplyOrder(req);
    return res.status(200).json({
        message: "order issued successfully",
        body: orderRes
      });
} catch (error) {
    return res.status(401).json({
        message: "order issued failed  " + error.message
      });
}
}
exports.updateSupplyOrder = async (req,res,next) => {
  try {
      let orderRes = await saleService.updateSupplyOrder(req);
      return res.status(200).json({
          message: "order updated successfully",
          body: orderRes
        });
  } catch (error) {
      return res.status(401).json({
          message: "order updated failed  " + error.message
        });
  }
  }
exports.doDelievary = async (req,res,next) => {
  try {
    let deliveryRes = {};
    if(req.body.isSupply){
      deliveryRes = await saleService.doSupplyOrderDelievary(req);
    }else{
      deliveryRes = await saleService.doSaleOrderDelievary(req);
    }
      
      return res.status(200).json({
          message: "Delivery added successfully",
          body: deliveryRes
        });
  } catch (error) {
      return res.status(401).json({
          message: "Delivery added failed  " + error.message
        });
  }
  }

exports.getSupplyOrderList = async (req,res,next) => {
  try {
      let supplyInvoiceList = await saleService.getSupplyInvoiceList(req);
      return res.status(200).json({
          message: "Invoice Fetched successfully",
          body: supplyInvoiceList
        });
  } catch (error) {
      return res.status(401).json({
          message: "Invoice Fetched failed  " + error.message
        });
  }
  }
  exports.getSupplyOrderById = async (req,res,next) => {
    try {
        let supplyInvoice = await saleService.getSupplyOrderById(req);
        return res.status(200).json({
            message: "Invoice Fetched successfully",
            body: supplyInvoice
          });
    } catch (error) {
        return res.status(401).json({
            message: "Invoice Fetched failed  " + error.message
          });
    }
    }