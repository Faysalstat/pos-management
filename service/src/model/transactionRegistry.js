const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const TransactionRegistry = db.sequelize.define("transactionRegistry", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  transactionType: Sequelize.STRING,
  transactionReason: Sequelize.STRING,
  transactionCategory: Sequelize.STRING,
  amount: Sequelize.DOUBLE,
  transactionDate:Sequelize.DATEONLY,
  approvedBy: Sequelize.STRING,
  issuedBy:Sequelize.STRING,
  refference: Sequelize.STRING,
  paymentMethod: Sequelize.STRING,
  accountNo:Sequelize.INTEGER,
  voucherNo: Sequelize.STRING,
  isDebit: Sequelize.INTEGER,
  GL_TYPE:Sequelize.STRING,
  payingTo:Sequelize.STRING,
  clientId: Sequelize.INTEGER
},{
    freezeTableName: true
  });

module.exports = TransactionRegistry;
    