const Sequelize = require("sequelize")
const db = require("../connector/db-connector");

const User = db.sequelize.define('user',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey:true
    },
    userName: Sequelize.STRING,
    password: Sequelize.STRING,
    userRole: Sequelize.STRING,
    email: Sequelize.STRING,
},{
    freezeTableName: true
  })
//   Person.associate = models => {
//     Person.hasOne(models.User);
//   }
module.exports = User;