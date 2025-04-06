const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const Account = db.sequelize.define(
  "account",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    balance:Sequelize.DOUBLE,
    accountType: Sequelize.STRING,
    category: Sequelize.STRING,
    clientId: Sequelize.INTEGER
  },
  {
    freezeTableName: true,
  }
);

module.exports = Account;
