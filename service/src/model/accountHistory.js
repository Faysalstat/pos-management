const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const AccountHistory = db.sequelize.define(
  "accountHistory",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    tnxDate: Sequelize.DATEONLY,
    tnxType: Sequelize.STRING,
    tnxAmount: Sequelize.DOUBLE,
    paymentMethod : Sequelize.STRING,
    remark: Sequelize.STRING,
    previousBalance: Sequelize.DOUBLE,
    voucherNo:Sequelize.STRING,
    clientId:Sequelize.INTEGER
  },
  {
    freezeTableName: true,
  }
);

module.exports = AccountHistory;
