const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const LoanClient = db.sequelize.define(
  "loanClient",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    clientName: Sequelize.STRING,
    clientDisc: Sequelize.STRING,
    clientId: Sequelize.INTEGER
  },
  {
    freezeTableName: true,
  }
);

module.exports = LoanClient;
