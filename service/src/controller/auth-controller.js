const authService = require("../service/auth-service")
exports.login = async (req, res, next) => {
  try {
    let response = await authService.authenticate(req,res);
    return res.status(200).json({
      isSuccess:response.isSuccess,
      body:response.body,
      message:response.message
    })
  } catch (error) {
    return res.status(404).json({
      isSuccess:false,
      message: "Login Failed!" + error.message,
    });
  }
   
};
exports.addUser = async (req, res, next) => {
    
    try {
      await authService.addUser(req,res);
    } catch (error) {
      return res.status(400).json({
        isSuccess:false,
        message: "Operation Failed!" + error.message,
      });
    }
}
exports.signout = async(req,res,next)=>{
    
    try {
      await authService.signOut(req,res,next);
    } catch (error) {
      return res.status(400).json({
        isSuccess:false,
        message: "Operation Failed!" + error.message,
      });
    }
}
exports.isLoggedIn = async (req,res,next)=>{
    try {
      await authService.isLoggedIn(req,res);
    } catch (error) {
      return res.status(400).json({
        isSuccess:false,
        message: "Operation Failed!" + error.message,
      });
    }
  }

  exports.checkExistingUser = async (req,res,next)=>{
    try {
      await authService.findUserByUserName(req,res);
    } catch (error) {
      return res.status(400).json({
        isSuccess:false,
        message: "Operation Failed!" + error.message,
      });
    }
  }
  exports.getAllUser = async (req,res,next)=>{
    try {
      await authService.getAllUser(req,res);
    } catch (error) {
      return res.status(400).json({
        isSuccess:false,
        message: "Operation Failed!" + error.message,
      });
    }
  }