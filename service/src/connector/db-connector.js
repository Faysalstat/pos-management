const mysql = require("mysql")
const dbConfig = require("../config/db.config")
const { Sequelize } = require('sequelize');
const pool = {
  max: 15,
  min: 5,
  idle: 20000,
  evict: 15000,
  acquire: 30000
};

// production 
// exports.sequelize = new Sequelize('vatasolu_retail_inventory_demo_db','vatasolu_vatadmin', 'Bzt#?ajtxWe?', {
//   host: 's813.bom1.mysecurecloudhost.com',
//   port: '3306',
//   dialect: 'mysql',
//   pool:pool
// });


// Local 
exports.sequelize = new Sequelize('retail_demo_db','retail_admin', 'admin', {
  host: 'localhost',
  port: '3306',
  dialect: 'mysql',
  pool:pool
});