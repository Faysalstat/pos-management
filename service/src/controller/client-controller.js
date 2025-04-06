const clientService = require("../service/client-service");

exports.addClient = async (req,res,next)=>{
    try {
        let newClient = await clientService.addClient(req);
        return res.status(200).json({
            message: "data added successfully",
            body: newClient
          });
    } catch (error) {
        return res.status(400).json({
            message: "data added Failed. ERROR:" + error.message
          });
    }
    
}

exports.getClientByContactNo = async (req,res,next)=>{
    try {
        let client = await clientService.getClientByContactNo(req);
        return res.status(200).json({
            message: "data added successfully",
            body: client
          });
    } catch (error) {
        return res.status(400).json({
            message: "data fetching Failed"
          });
    }
}

exports.getClientByClientType = async (req,res,next)=>{
    try {
        let client = await clientService.getClientByClientType(req);
        return res.status(200).json({
            message: "Client List Fetched Successfully",
            body: client
          });
    } catch (error) {
        return res.status(400).json({
            message: "Client List Fetched Failed"
          });
    }
}

exports.getSupplyerByCode = async (req,res,next)=>{
    try {
        let supplyer = await clientService.getSupplyerByCode(req);
        return res.status(200).json({
            message: "Supplyer Found",
            body: supplyer
          });
    } catch (error) {
        return res.status(400).json({
            message: "Suuplyer Not Found"
          });
    }
}
exports.getCustomerById = async (req,res,next)=>{
    try {
        let customer = await clientService.getCustomerById(req);
        return res.status(200).json({
            message: "customer Found",
            body: customer
          });
    } catch (error) {
        return res.status(400).json({
            message: "customer Not Found"
          });
    }
}

exports.getAllClient = async (req,res,next)=>{
    try {
        let clientList = await clientService.getAllClient(req);
        return res.status(200).json({
            message: "Client List Fetced",
            body: clientList
          });
    } catch (error) {
        return res.status(400).json({
            message: "Client List Fetced Failed "+ error.message
          });
    }
}

exports.getPersonById = async (req,res,next)=>{
    try {
        let person = await clientService.getPersonById(req);
        return res.status(200).json({
            message: "person Found",
            body: person
          });
    } catch (error) {
        return res.status(400).json({
            message: "person Not Found"
          });
    }
}

exports.updateClient = async (req,res,next)=>{
    try {
        let status = await clientService.updateClient(req);
        return res.status(200).json({
            isSuccess:true,
            message:status
          });
    } catch (error) {
        return res.status(400).json({
            isSuccess:false,
            message:error.message
          });
    }
}

exports.getAccountHistoryByAccId = async (req,res,next)=>{
    try {
        let accountHistories = await clientService.getAccountHistoryByAccId(req);
        return res.status(200).json({
            isSuccess:true,
            body:accountHistories
          });
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:error.message
          });
    }
}
exports.getEmployeeByCodeOrID = async (req,res,next)=>{
    let isSuccess = false;
    try {
        let clients = await clientService.getEmployeeByCodeOrID(req);
        if(clients){
            isSuccess = true;
        }else{
            isSuccess = false
        }
        return res.status(200).json({
            isSuccess:isSuccess,
            body:clients
          });
    } catch (error) {
        return res.status(400).json({
            isSuccess:isSuccess,
            message:error.message
          });
    }
}

exports.getClientByAccId = async (req,res,next)=>{
    try {
        let client = await clientService.getClientByAccId(req);
        return res.status(200).json({
            isSuccess:true,
            body:client
          });
    } catch (error) {
        return res.status(400).json({
            isSuccess:false,
            message:error.message
          });
    }
}

