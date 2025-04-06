const accountService = require("../service/account-service");
exports.fetchInvGlAccountDetails = async (req,res,next) => {
    try {
      let account = await accountService.fetchInvGlAccountDetails(req);
      return res.status(200).json({
        body: account,
        isSuccess: true,
        message:"Account Details Found"
      });
    } catch (error) {
      return res.status(400).json({
        message: "Account Details Not Found." + error.message,
        isSuccess: false,
      });
    }
  };
  exports.fetchhLoanRegistry = async (req,res,next)=>{
    try {
      let loanTransactions = await accountService.fetchhLoanRegistry(req);
      return res.status(200).json({
        body: loanTransactions,
        isSuccess: true,
        message:"Loan Details Found"
      });
    } catch (error) {
      return res.status(400).json({
        message: "Loan Details Not Found." + error.message,
        isSuccess: false,
      });
    }
  }

  exports.fetchhLoanDetails = async (req,res,next)=>{
    try {
      let loanDetails = await accountService.fetchhLoanDetails(req);
      return res.status(200).json({
        body: loanDetails,
        isSuccess: true,
        message:"Loan Details Found"
      });
    } catch (error) {
      return res.status(400).json({
        message: "Loan Details Not Found." + error.message,
        isSuccess: false,
      });
    }
  }

  exports.fetchAllAccountByCategory = async (req,res,next)=>{
    try {
      let accountList = await accountService.fetchAllAccountByCategory(req);
      return res.status(200).json({
        body: accountList,
        isSuccess: true,
        message:"Account List Found"
      });
    } catch (error) {
      return res.status(400).json({
        message: "Account List Not Found." + error.message,
        isSuccess: false,
      });
    }
  }

  exports.fetchGlDetails = async (req,res,next)=>{
    try {
      let gls = await accountService.fetchGlDetails(req);
      return res.status(200).json({
        body: gls,
        isSuccess: true,
        message:"GL Details Found"
      });
    } catch (error) {
      return res.status(400).json({
        message: "GL Details Not Found." + error.message,
        isSuccess: false,
      });
    }
  }

  exports.fetchProfitCalculation = async (req,res,next)=>{
    try {
      let responseData = await accountService.fetchProfitCalcuationData(req);
      return res.status(200).json({
        body: responseData,
        isSuccess: true,
        message:"Profit Details Found"
      });
    } catch (error) {
      return res.status(400).json({
        message: "Profit Details Not Found." + error.message,
        isSuccess: false,
      });
    }
  }
  