const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const Customer = db.sequelize.define(
  "customer",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    shopName: Sequelize.STRING,
    shopAddress: Sequelize.STRING,
    clientId: Sequelize.INTEGER
  },
  {
    freezeTableName: true,
  }
);

module.exports = Customer;
