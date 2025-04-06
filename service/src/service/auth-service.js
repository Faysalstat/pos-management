const Client = require("../model/client");
const Person = require("../model/person");
const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.authenticate = async (req, res) => {
  let payload = req.body;
  let authenticateUser = new User();
  let user = {};
  try {
    user = await User.findOne({
      where: { userName: req.body.username },
      include: [Person, Client],
    });
    if (!user) {
      throw new Error("User not found");
    }
    authenticateUser = {
      id: user.id,
      userName: user.userName,
      userRole: user.userRole,
      person: user.person,
      client: user.client

    };
  } catch (err) {
    return {
      isSuccess: false,
      message: "User Not Found",
      body: {}
    };
  }
  try {
    const cmp = await bcrypt.compare(payload.password, user.password);
    if (cmp) {
      const token = jwt.sign(
        {
          userid: user.id,
          userRole: user.userRole,
          userName: user.userName,
          clientId: authenticateUser.client.id

        },
        "asdfgj",
        {
          expiresIn: "2h",
        }
      );
      return {
        message: "Login Successfull",
        isSuccess: true,
        body: {
          userid: authenticateUser.id,
          username: authenticateUser.userName,
          personName: authenticateUser.person.personName || "",
          userRole: authenticateUser.userRole,
          clientId: authenticateUser.client.id,
          userClientName: authenticateUser.client.clientName,
          shopName: authenticateUser.client.shopName,
          shopAddress: authenticateUser.client.shopAddress,
          shopContactNo: authenticateUser.client.shopContactNo,
          token: token,
        },
      };
    } else {
      return {
        isSuccess: false,
        message: "Wrong Credential",
      };
    }
  } catch (error) {
    throw new Error("Server Error " + error.message)
  }
};

exports.signOut = (req, res, next) => {
  req.session.destroy();
  return res.status(200).json({
    message: "User Sign out",
  });
};

exports.isLoggedIn = async (req, res, next) => {
  let decoded = {};
  try {
    decoded = jwt.verify(req.query.token, "asdfgj");
  } catch (error) {
    return res.status(200).json({
      body: {
        status: false,
      },
    });
  }
  try {
    if(!decoded.clientId){
      throw new Error("Client Id not found");
    }
    User.findOne({ where: { id: decoded.userid, clientId: decoded.clientId } })
      .then((authenticatedUser) => {
        if (authenticatedUser) {
          return res.status(200).json({
            body: {
              status: true,
              userRole: authenticatedUser.userRole,
            },
          });
        } else {
          return res.status(200).json({
            body: {
              status: false,
            },
          });
        }
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  } catch (error) {
    return res.status(404).json({
      isSuccess: false,
      message: "Login Failed! Server Error!",
      error: err.message,
    });
  }

};
exports.addUser = async (req, res, next) => {
  let payload = req.body;
  let personId;
  let person;
  let clientId;
  try {

    if (payload.clientId && payload.clientId != "") {
      clientId = payload.clientId;
    } else {
      throw new Error("Client ID not provided");
    }
    if (payload.personId && payload.personId != 0) {
      personId = payload.personId;
    } else {
      person = {
        personName: payload.personName,
        contactNo: payload.contactNo,
        personAddress: payload.personAddress,
        email: payload.email,
        clientId: clientId
      };
      let newperson = await Person.create(person);
      personId = newperson.id;
    }

    let user = {
      userName: payload.userName,
      userRole: payload.userRole,
      personId: personId,
      clientId: clientId,
      email: payload.email
    };
    bcrypt.hash(payload.password, 10, (err, hash) => {
      user.password = hash;
      User.create(user)
        .then((newuser) => {
          return res.status(200).json({
            message: "User Creation Failed",
            body: newuser.dataValues,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  } catch (error) {
    return res.status(200).json({
      message: "User Creation Failed",
      body: err,
    });
  }
};
exports.findUserByUserName = async (req, res, next) => {
  let params = req.query;
  let clientId;
  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    let user = await User.findOne({ where: { userName: params.userName, clientId: params.clientId } });
    if (user) {
      return res.status(200).json({
        message: "This user already exists",
        body: true,
      });
    } else {
      return res.status(200).json({
        message: "This user does not exists",
        body: false,
      });
    }
  } catch (error) {
    return res.status(200).json({
      message: "This user does not exists",
      body: false,
    });
  }
};

exports.getAllUser = async (req, res, next) => {
  let userList = [];
  let params = req.query;
  let query = {};
  try {
    if (params.username && params.username != '') {
      query.userName = params.username;
    }
    if (params.clientId && params.clientId != '') {
      query.clientId = params.clientId;
    }
    userList = await User.findAll({ where: query });
    return res.status(200).json({
      message: "Userlist Fetched",
      body: userList,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
}
