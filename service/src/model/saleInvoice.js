const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const SaleInvoice = db.sequelize.define(
  "saleInvoice",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    invoiceNo: Sequelize.STRING,
    doNo: Sequelize.STRING,
    purchaseDate: Sequelize.DATEONLY,
    totalPrice: Sequelize.DOUBLE,
    previousBalance: Sequelize.DOUBLE,
    totalPayableAmount: Sequelize.DOUBLE,
    totalPaidAmount: Sequelize.DOUBLE,
    dueAmount: Sequelize.DOUBLE,
    rebate: Sequelize.DOUBLE,
    paymentMethod : Sequelize.STRING,
    comment: Sequelize.STRING,
    deliveryStatus: Sequelize.STRING,
    chargeReason: Sequelize.STRING,
    extraCharge : Sequelize.DOUBLE,
    issuedBy: Sequelize.STRING,
    approvedBy: Sequelize.STRING,
    clientId: Sequelize.INTEGER,
    voucherNo: Sequelize.STRING
  },
  {
    freezeTableName: true,
  }
);

module.exports = SaleInvoice;
