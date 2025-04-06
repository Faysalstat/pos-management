const Sequelize = require("sequelize")
const db = require("../connector/db-connector");

const Person = db.sequelize.define('person',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey:true
    },
    personName: Sequelize.STRING,
    nId: Sequelize.STRING,
    fatherName: Sequelize.STRING,
    contactNo: Sequelize.STRING,
    personAddress: Sequelize.STRING,
    email: Sequelize.STRING,
    clientId: Sequelize.INTEGER
},{
    freezeTableName: true
  })
//   Person.associate = models => {
//     Person.hasOne(models.User);
//   }
module.exports = Person;