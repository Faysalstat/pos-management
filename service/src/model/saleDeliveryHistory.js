const Sequelize = require("sequelize")
const db = require("../connector/db-connector");
const SaleDeliveryHistory = db.sequelize.define(
    "saleDeliveryHistory",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      deliverableQuantity: Sequelize.DOUBLE,
      deliveryDate: Sequelize.DATE,
      deliveryType:Sequelize.STRING,
      deliveredTo: Sequelize.STRING,
      clientId: Sequelize.INTEGER
    });


    module.exports = SaleDeliveryHistory;