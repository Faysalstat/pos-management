const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const SupplyOrder = db.sequelize.define(
  "supplyOrder",
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
    totalPrice: Sequelize.DOUBLE,
    deliveryStatus: Sequelize.STRING,
    quantityDelivered: Sequelize.DOUBLE,
    qunatityDeliveryPending: Sequelize.DOUBLE,
    pricePerUnit: Sequelize.DOUBLE,
    tnxDate: Sequelize.DATEONLY,
    state: Sequelize.STRING,
    quantityReturned: Sequelize.INTEGER,
    clientId: Sequelize.INTEGER
  },
  {
    freezeTableName: true,
  }
);

module.exports = SupplyOrder;
