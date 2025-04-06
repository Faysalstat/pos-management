const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const GlAccount = db.sequelize.define(
  "glAccount",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    glName:Sequelize.STRING,
    balance: Sequelize.DOUBLE,
    glType: Sequelize.STRING,
    clientId: Sequelize.INTEGER
  },
  {
    freezeTableName: true,
  }
);

module.exports = GlAccount;
