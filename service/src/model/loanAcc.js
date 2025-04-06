const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const LoanAccount = db.sequelize.define(
  "loanAccount",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    loanAmmount:Sequelize.DOUBLE,
    interestRate: Sequelize.DOUBLE,
    receiveDate: Sequelize.DATEONLY,
    returnDate: Sequelize.DATEONLY,
    period: Sequelize.INTEGER,
    issuedBy: Sequelize.STRING,
    approvedBy: Sequelize.STRING,
    remark: Sequelize.STRING,
    status: Sequelize.STRING,
    clientId: Sequelize.INTEGER
  },
  {
    freezeTableName: true,
  }
);

module.exports = LoanAccount;
