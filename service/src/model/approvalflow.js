const Sequelize = require("sequelize")
const db = require("../connector/db-connector");

const ApprovalFlow = db.sequelize.define('approvalflow',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey:true 
    },
    payload: Sequelize.BLOB,
    createdBy: Sequelize.STRING,
    taskType: Sequelize.STRING,
    status: Sequelize.STRING,
    clientId: Sequelize.INTEGER,
    state: Sequelize.STRING
},{
    freezeTableName: true
  })
module.exports = ApprovalFlow;