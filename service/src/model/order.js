const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const Order = db.sequelize.define(
  "order",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    orderNo: Sequelize.STRING,
    packageQuantity : Sequelize.INTEGER,
    looseQuantity: Sequelize.INTEGER,
    quantityOrdered: Sequelize.INTEGER,
    pricePerUnit:Sequelize.DOUBLE,
    buyingPricePerUnit:Sequelize.DOUBLE,
    quantityDelivered:Sequelize.INTEGER,
    qunatityDeliveryPending: Sequelize.INTEGER,
    totalPrice: Sequelize.DOUBLE,
    state: Sequelize.STRING,
    deliveryStatus: Sequelize.STRING,
    tnxDate: Sequelize.DATEONLY,
    quantityReturned: Sequelize.INTEGER,
    clientId: Sequelize.INTEGER
  },
  {
    freezeTableName: true,
  }
);

module.exports = Order;
