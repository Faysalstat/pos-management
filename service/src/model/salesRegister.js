const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const SalesRegister = db.sequelize.define("salesRegister", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  productName: Sequelize.STRING,
  quantitySold: Sequelize.INTEGER,
  totalPrice: Sequelize.DOUBLE,
  // retail / wholesale 
  saleType: Sequelize.STRING,
  purchaseDate: Sequelize.DATEONLY,
  voucherNo: Sequelize.STRING,
  clientId: Sequelize.INTEGER
},{
    freezeTableName: true
  });

module.exports = SalesRegister;
