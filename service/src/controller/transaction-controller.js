const transactionService = require('../service/transaction-service')

exports.getTransactionReport = async (req,res,next)=>{
    try {
        let transactionList = await transactionService.getTreansactionReport(req);
        return res.status(200).json({
          message: "Transaction Report Fetching successfully",
          body: transactionList,
        });
    } catch (error) {
        return res.status(401).json({
            message: "Transaction Report Fetching failed  " + error.message
          });
    }
}

exports.doTransactionPayment = async(req,res,next)=>{
  try {
    let voucherNo = await transactionService.doTransactionPayment(req);
    return res.status(200).json({
      isSuccess:true,
      message: "Transaction Successful",
      voucherNo: voucherNo,
    });
} catch (error) {
    return res.status(401).json({
      isSuccess:false,
        message: "Transaction Report Fetching failed  " + error.message
      });
}
}

exports.fetchTransactionReasons = async (req,res,next) => {
  try {
      let transactionReasonList = await transactionService.fetchTransactionReasons(req);
      return res.status(200).json({
          message: "data fetched successfully",
          body: transactionReasonList
        });
  } catch (error) {
      return res.status(400).json({
          message: "data added failed."+ error.message
      });
  }
}

exports.addTransactionReason = async (req, res, next) => {
  try {
    let reason = await transactionService.addTransactionReason(req);
    return res.status(200).json({
      message: "data added successfully",
      body: reason,
    });
  } catch (error) {
    return res.status(400).json({
      message: "data fetching Failed",
    });
  }
};
exports.deleteTnxReason = async (req, res, next) => {
  try {
    let deletedStatus = await transactionService.deleteTnxReason(req);
    return res.status(200).json({
      message: deletedStatus,
      isSuccess: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Operation failed." + error.message,
      isSuccess: false,
    });
  }
};

exports.doExpenseTransaction = async (req,res,next)=>{
  try {
    let voucherNo = await transactionService.doExpenseTransaction(req);
    return res.status(200).json({
      voucherNo: voucherNo,
      isSuccess: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Operation failed." + error.message,
      isSuccess: false,
    });
  }
}
exports.doSalaryPaymentTransaction = async (req,res,next)=>{
  try {
    let tnxStatus = await transactionService.doSalaryPaymentTransaction(req);
    return res.status(200).json({
      message: tnxStatus,
      isSuccess: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Operation failed." + error.message,
      isSuccess: false,
    });
  }
}

exports.payInstallment = async (req,res,next)=>{
  try {
    let tnxStatus = await transactionService.payInstallment(req);
    return res.status(200).json({
      message: tnxStatus,
      isSuccess: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Operation failed." + error.message,
      isSuccess: false,
    });
  }
}


 