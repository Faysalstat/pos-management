const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const Client = db.sequelize.define(
  "client",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    code:Sequelize.STRING,
    clientName:Sequelize.STRING,
    shopName: Sequelize.STRING,
    shopAddress: Sequelize.STRING,
    shopContactNo: Sequelize.STRING,
  },
  {
    freezeTableName: true,
  }
);

module.exports = Client;
