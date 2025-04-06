const Sequelize = require("sequelize")
const db = require("../connector/db-connector");
const DepositHistory = db.sequelize.define(
    "depositHistory",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      tnxType: Sequelize.STRING,
      tnxDate: Sequelize.DATE,
      payedBy: Sequelize.STRING,
      receivedBy:Sequelize.STRING,
      tnxAmount: Sequelize.STRING,
      clientId: Sequelize.INTEGER
    });


    module.exports = DepositHistory;