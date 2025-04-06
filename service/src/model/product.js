const Sequelize = require("sequelize")
const db = require("../connector/db-connector");

const Product = db.sequelize.define('product',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey:true
    },
    productCode: Sequelize.STRING,
    productName: Sequelize.STRING,
    brandName: Sequelize.STRING,
    unitType: Sequelize.STRING,
    quantity: Sequelize.INTEGER,
    quantitySold: Sequelize.INTEGER,
    quantityReturn: Sequelize.INTEGER,
    quantityDamaged: Sequelize.INTEGER,
    costPricePerUnit: Sequelize.DOUBLE,
    sellingPricePerUnit: Sequelize.DOUBLE,
    packagingCategory: Sequelize.STRING,
    productCategory: Sequelize.STRING,
    unitPerPackage: Sequelize.INTEGER,
    clientId: Sequelize.INTEGER
},{
    freezeTableName: true
  })

module.exports = Product;