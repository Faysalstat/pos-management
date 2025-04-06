const express = require("express");
const bodyParser = require("body-parser");
const connector = require("./src/connector/db-connector");
var port = process.env.SERVER_PORT || 3000;
const app = express();
const sessions  = require('express-session')
const dbModels = require('./src/model/init-model')

var http = require("http").Server(app);
app.use(bodyParser.json());

const cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);
// / creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

//session middleware
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: true
}));




connector.sequelize
  .authenticate()
  .then(() => {
    console.log("database connected!");
    
  })
  .catch((err) => {
    console.log("Error Creating database connection " + err);
  });



  connector.sequelize.sync().then((res)=>{
    console.log("Database synchronised");
    const server = app.listen(port, () => {
    console.log("server is running on ");
    });
  }).catch((err)=>{
    console.log("database synchronise failed!!!" +err)
  });

const authRoute = require("./src/router/auth-route")
const productRoute = require("./src/router/product-route");
const personRoute = require("./src/router/person-route");
const saleRoute = require('./src/router/sale-route')
const supplyRoute = require('./src/router/supply-route')
const configRoute = require('./src/router/config-route')
const transactionRoute = require('./src/router/transaction-route')
const approvalRoute = require('./src/router/approval-route')
const reportRoute = require('./src/router/report-route')
const accountRoute = require('./src/router/account-route')
const assetsRoute = require('./src/router/assets-route')
const appClientRoute = require('./src/router/client-route')


app.use("/api/auth", authRoute);
app.use("/api/account", accountRoute);
app.use("/api/config", configRoute);
app.use("/api/approval", approvalRoute);
app.use("/api/product", productRoute);
app.use("/api/client", personRoute);
app.use("/api/sales", saleRoute);
app.use("/api/supply", supplyRoute);
app.use("/api/transaction", transactionRoute);
app.use("/api/report", reportRoute);
app.use("/api/asset", assetsRoute);
app.use("/api/appclient", appClientRoute);


