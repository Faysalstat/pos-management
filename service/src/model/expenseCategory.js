const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const ExpenseCategory = db.sequelize.define('expenseCategory',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey:true
    },
    type:Sequelize.STRING,
    expenseName: Sequelize.STRING,
    categoryName: Sequelize.STRING,
    clientId: Sequelize.INTEGER
},{
    freezeTableName: true
  })
module.exports = ExpenseCategory;