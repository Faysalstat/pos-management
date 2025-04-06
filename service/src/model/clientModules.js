const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const ClientModule = db.sequelize.define(
  "clientModule",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    moduleName: Sequelize.STRING,
    iconUrl: Sequelize.STRING,
    route: Sequelize.STRING,
    userRole: Sequelize.STRING,
    clientId: Sequelize.STRING
  },
  {
    freezeTableName: true,
  }
);

module.exports = ClientModule;
