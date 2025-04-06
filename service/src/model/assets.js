const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const Assets = db.sequelize.define(
  "assets",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    assetName:Sequelize.STRING,
    purchaseDate:Sequelize.DATEONLY,
    buyingPrice:Sequelize.DOUBLE,
    presentValue:Sequelize.DOUBLE,
    quantity:Sequelize.INTEGER,
    discription: Sequelize.STRING,
    status: Sequelize.STRING,
    clientId: Sequelize.INTEGER
  },
  {
    freezeTableName: true,
  }
);

module.exports = Assets;
