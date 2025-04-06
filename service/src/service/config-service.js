const AccountHistory = require("../model/accountHistory");
const AppConfig = require("../model/appConfig");
const ClientModule = require("../model/clientModules");
const SaleInvoice = require("../model/saleInvoice");
const TransactionRegistry = require("../model/transactionRegistry");
const { Op } = require("sequelize");

exports.getConfig = async (req) => {
    let query = req.query;
    let clientId;
    if (query.clientId && query.clientId != "") {
        clientId = query.clientId;
    } else {
        throw new Error("Client ID not provided");
    }
    try {
        let config = await AppConfig.findOne({where:{configName:query.configName,clientId:clientId}});
        return config;
    } catch (error) {
        throw new Error(error.message);
    }
}


exports.addConfig = async (req) => {
    let payload = req.body;
    let clientId;
    if (payload.clientId && payload.clientId != "") {
        clientId = payload.clientId;
    } else {
        throw new Error("Client ID not provided");
    }
    try {
        let configModel = {
            configName:payload.configName,
            value: payload.value,
            clientId:clientId
        };
        let addedConfig = await AppConfig.create(configModel)
        return addedConfig;
    } catch (error) {
        throw new Error("Failed "+ error.message);
    }
}

exports.getRoleWiseModule = async (req)=>{
    let roleName = req.query.roleName;
    let modules = []
    try {
        modules = await ClientModule.findAll({where:{userRole: roleName}});
        return modules;
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.adjustment = async (req) => {
    let payload = req.body;
    try {
        let invoices = await SaleInvoice.findAll();
        for(let i =0;i<invoices.length;i++){
            let invoice = invoices[i];
            let transactionList = await TransactionRegistry.findAll({where:{refference:{
                [Op.like]:'%'+invoice.invoiceNo+'%'
            }}});
            let voucherNo = transactionList[0].voucherNo;
            let updatedInvoice = await SaleInvoice.update({voucherNo:voucherNo},{where:{id:invoice.id}});
            let updatedAccountHistory = await AccountHistory.update({voucherNo:voucherNo},{where:{remark:{
                [Op.like]:'%'+invoice.invoiceNo+'%'
            }}});
        }
        
        return "Done";
    } catch (error) {
        throw new Error("Failed "+ error.message);
    }
}