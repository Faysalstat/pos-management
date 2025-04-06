const Client = require("../model/client");

exports.getClientDetailsById = async (req, res, next) => {
    let clientId = req.query.clientId;
    try {
      let clientDetails = await Client.findOne({where:{id:clientId}});
      return res.status(200).json({
        message: "Client Details Found successfully",
        body: clientDetails,
      });
    } catch (error) {
      return res.status(401).json({
        message: "Client Details Found failed  " + error.message,
      });
    }
  };

  exports.createClient = async (req, res, next) => {
    let payload = req.params;
    try {
    let client = {
        code:payload.code,
        clientName:payload.clientName,
        shopName: payload.shopName
    }
      let clientDetails = await Client.create(client);
      return res.status(200).json({
        message: "Client Added successfully",
        // body: clientDetails,
      });
    } catch (error) {
      return res.status(401).json({
        message: "Client Added failed  " + error.message,
      });
    }
  };