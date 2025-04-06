const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const ProductCategory = db.sequelize.define(
  "productCategory",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    key: Sequelize.STRING,
    value: Sequelize.STRING,
    clientId: Sequelize.INTEGER
  },
  {
    freezeTableName: true,
  }
);

module.exports = ProductCategory;
