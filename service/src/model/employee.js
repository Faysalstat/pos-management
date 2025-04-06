const Sequelize = require("sequelize");
const db = require("../connector/db-connector");

const Employee = db.sequelize.define(
  "employee",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    employeeId: Sequelize.STRING,
    designation: Sequelize.STRING,
    joiningDate: Sequelize.DATEONLY,
    fatherName: Sequelize.STRING,
    role: Sequelize.STRING,
    clientId: Sequelize.INTEGER
  },
  {
    freezeTableName: true,
  }
);

module.exports = Employee;
