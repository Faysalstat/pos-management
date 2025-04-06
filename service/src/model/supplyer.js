const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const Supplyer = db.sequelize.define(
  "supplyer",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    code : Sequelize.STRING,
    companyName : Sequelize.STRING,
    shopName: Sequelize.STRING,
    brand: Sequelize.STRING,
    regNo: Sequelize.STRING,
    website: Sequelize.STRING,
    clientId: Sequelize.INTEGER
    
  },
  {
    freezeTableName: true,
  }
);

module.exports = Supplyer;
