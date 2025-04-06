const ApprovalFlow = require("../model/approvalflow");

exports.createApprovalFLow = async (req) => {
  let payload = req.body;
  try {
    let approval = await ApprovalFlow.create(payload);
    return approval;
  } catch (error) {
    throw new Error("Approval Creation Failed");
  }
};
exports.rejectApproval = async (req) => {
  let payload = req.body;
  let clientId;
  if(payload.clientId && payload.clientId!=''){
    clientId  = payload.clientId;
  }else{
    throw new Error("Client ID not provided");
  }
  try {
    let approval = await ApprovalFlow.destroy({where:{id:payload.taskId,clientId:clientId}});
    return approval;
  } catch (error) {
    throw new Error("Approval Reection Failed");
  }
};
exports.getById = async (req, res, next) => {
  let params = req.query
  let taskDetail = {};
  let clientId;
  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    taskDetail = await ApprovalFlow.findOne({
      where: { id: req.query.taskId,clientId:clientId },
    });
    let obj = JSON.parse(taskDetail.payload);
    return {
      message: "Task Detail Found",
      body: {
        taskType: taskDetail.taskType,
        state: taskDetail.state,
        payload: obj
      },
    };
  } catch (error) {
    throw new Error("Task Detail Found. Error:"+error.message);
  }
};

exports.getAllApproval = async (req, res, next) => {
  let params = req.query;
  let offsets = Number(params.offset);
  let limit = Number(params.limit);
  let query = {};
  let taskList = {};
  let length = 0;
  if(params.clientId && params.clientId!=''){
    query.clientId  = params.clientId;
  }else{
    throw new Error("Client ID not provided");
  }
  if(params.status && params.status!=""){
    query.status = params.status
  }
  try {
    taskList = await ApprovalFlow.findAll({ where: query });
    length = await ApprovalFlow.count({ where: query });
    return {
      message: "Task List Fetched",
      body: {
        data: taskList,
        length: length,
      },
    }
  } catch (error) {
    throw new Error("Task List Fetching failed")
  }
};

exports.declineApprovalFLow = async (req, res, next) => {
  let payload = req.body;
  let invoice = {};
  let clientId;
  if(payload.clientId && payload.clientId!=''){
    clientId  = payload.clientId;
  }else{
    throw new Error("Client ID not provided");
  }
  try {
    ApprovalFlow.destroy({ where: { id: payload.taskId,clientId:clientId} })
      .then((data) => {
        return res.status(200).json({
          message: "approval flow deleted",
          body: data,
        });
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  } catch (error) {
    return res.status(200).json({
      message: "approval flow deleted failed",
      body: error,
    });
  }
};
