const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const SupplyInvoice = db.sequelize.define(
  "supplyInvoice",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    invoiceNo: Sequelize.STRING,
    purchaseDate: Sequelize.DATEONLY,
    totalPrice: Sequelize.DOUBLE,
    rebate: Sequelize.DOUBLE,
    remarks: Sequelize.STRING,
    deliveryStatus: Sequelize.STRING,
    issuedBy: Sequelize.STRING,
    approvedBy: Sequelize.STRING,
    clientId: Sequelize.INTEGER,
    voucherNo: Sequelize.STRING
  },
  {
    freezeTableName: true,
  }
);

module.exports = SupplyInvoice;
