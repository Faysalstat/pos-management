const approvalService = require("../service/approval-service");

exports.sendToApproval = async (req,res,next)=>{
    try {
        let response = await approvalService.createApprovalFLow(req);
        return res.status(200).json(response); 
    } catch (error) {
        return res.status(400).json({
            message: "Approval Sent Faield" + error.message
          });
    }
}

exports.rejectApproval = async (req,res,next)=>{
    try {
        let response = await approvalService.rejectApproval(req);
        return res.status(200).json(response); 
    } catch (error) {
        return res.status(200).json({
            message: "Approval Rejected Faield" + error.message
          });
    }
}
exports.getApprovalList = async (req,res,next) =>{
    
    try {
        let response = await approvalService.getAllApproval(req,res,next);
        return res.status(200).json(response); 
    } catch (error) {
        return res.status(400).json({
            message: "Approval List Fetched Faield" + error.message,
            
          });
    }
}

exports.getApprovalById = async (req,res,next) =>{
    
    try {
        let response = await approvalService.getById(req,res,next);
        return res.status(200).json(response); 
    } catch (error) {
        return res.status(200).json({
            message: "Approval List Fetched Faield" + error.message,
            
          });
    }
}