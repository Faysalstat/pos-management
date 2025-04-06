const { Op } = require("sequelize");
const Account = require("../model/account");
const AccountHistory = require("../model/accountHistory");
const Customer = require("../model/customer");
const Person = require("../model/person");
const Supplyer = require("../model/supplyer");
const db = require("../connector/db-connector");
const Employee = require("../model/employee");
const GlAccount = require("../model/glAccounts");
const { GL_TYPES } = require("../model/enums");
const LoanClient = require("../model/loanClient");
const LoanAccount = require("../model/loanAcc");

exports.addClient = async (req) => {
  let payload = req.body;
  let personModel;
  let person = {};
  let personId;
  let account;
  let newClient;
  let createdClient;
  let clientId;
  try {
    if (payload.clientType != "LOAN_ACC") {
      if (!payload.contactNo || payload.contactNo == "") {
        throw new Error("No Contact No Provided");
      }
    }
    if (payload.clientId && payload.clientId != "") {
      clientId = payload.clientId;
    } else {
      throw new Error("Client ID not provided");
    }
    if (payload.personId && payload.personId != 0) {
      personId = payload.personId;
    } else {
      personModel = {
        personName: payload.personName || "",
        contactNo: payload.contactNo,
        personAddress: payload.personAddress,
        email: payload.email,
        nId: payload.nId || "",
        clientId: payload.clientId || 1,
        fatherName: payload.fatherName || "",
        clientId: clientId,
      };
      person = await Person.create(personModel);
      personId = person.id;
    }

    if (payload.clientType == "CUSTOMER") {
      let liabilityGl = await GlAccount.findOne({
        where: { glName: GL_TYPES.LIABILITY_GL },
      });
      let accountModel = {
        balance: 0,
        accountType: "CUSTOMER",
        glAccountId: liabilityGl.id,
        category: "CLIENT",
        clientId: clientId,
      };
      account = await Account.create(accountModel);
      let customerModel = {
        personId: personId,
        accountId: account.id,
        shopName: payload.shopName,
        shopAddress: payload.shopAddress,
        clientId: clientId,
      };
      newClient = await Customer.create(customerModel);
      createdClient = await Customer.findOne({
        where: { id: newClient.id },
        include: [Account, Person],
      });
    } else if (payload.clientType == "SUPPLYER") {
      let assetGl = await GlAccount.findOne({
        where: { glName: GL_TYPES.ASSET_GL, clientId: clientId },
      });
      let accountModel = {
        balance: 0,
        accountType: "SUPPLYER",
        glAccountId: assetGl.id,
        category: "CLIENT",
        clientId: clientId,
      };
      account = await Account.create(accountModel);
      let supplyerModel = {
        personId: personId,
        accountId: account.id,
        code: payload.code,
        companyName: payload.companyName,
        shopName: payload.shopName,
        brand: payload.brandName,
        regNo: payload.regNo,
        website: payload.website,
        clientId: clientId,
      };
      newClient = await Supplyer.create(supplyerModel);
      createdClient = await Supplyer.findOne({
        where: { id: newClient.id },
        include: [Account, Person],
      });
    } else if (payload.clientType == "EMPLOYEE") {
      let expenseGl = await GlAccount.findOne({
        where: { glName: GL_TYPES.EXPENSE_GL, clientId: clientId },
      });
      let accountModel = {
        balance: 0,
        accountType: "EMPLOYEE",
        glAccountId: expenseGl.id,
        category: "CLIENT",
        clientId: clientId,
      };
      account = await Account.create(accountModel);
      let employeeModel = {
        personId: personId,
        accountId: account.id,
        employeeId: payload.employeeId,
        designation: payload.designation,
        joiningDate: payload.joiningDate,
        role: payload.role,
        clientId: clientId,
      };
      newClient = await Employee.create(employeeModel);
      createdClient = await Employee.findOne({
        where: { id: newClient.id },
        include: [Account, Person],
      });
    } else if (payload.clientType == "LOAN_ACC") {
      if (
        !payload.clientName ||
        !payload.clientDisc ||
        payload.clientName == "" ||
        payload.clientDisc == ""
      ) {
        throw new Error("Invalid Form");
      }
      let loanClientModel = {
        clientName: payload.clientName,
        clientDisc: payload.clientDisc,
        clientId: clientId,
      };

      newClient = await LoanClient.create(loanClientModel);
      createdClient = await LoanClient.findOne({
        where: { id: newClient.id },
      });
    }
    return createdClient;
  } catch (error) {
    throw new Error(error);
  }
};

exports.getClientByContactNo = async (req) => {
  let params = req.query;
  let client = {};
  let clientId;
  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    let person = await Person.findOne({
      where: { contactNo: params.contactNo, clientId: clientId },
      include: [
        { model: Customer, include: [Account, Person] },
        { model: Supplyer, include: [Account, Person] },
      ],
    });

    return person;
  } catch (error) {
    throw new Error(error);
  }
};

exports.getClientByClientType = async (req) => {
  let params = req.query;
  let client = {};
  let clientId;
  if (params.clientId && params.clientId != "") {
    clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    if (query.clientType == "CUSTOMER") {
      client = await Customer.findOne({
        where: { contactNo: params.contactNo, clientId: clientId },
        include: [Person, Account],
      });
    }
    return client;
  } catch (error) {
    throw new Error(error);
  }
};

exports.getSupplyerByCode = async (req) => {
  let query = {};
  if (req.query.code != "") {
    query.code = req.query.code;
  }
  if (req.query.id != "") {
    query.id = req.query.id;
  }
  if (req.query.clientId != "") {
    query.clientId = req.query.clientId;
  }
  let supplyer = {};
  try {
    supplyer = await Supplyer.findOne({
      where: query,
      include: [Person, { model: Account, include: AccountHistory }],
    });

    return supplyer;
  } catch (error) {
    throw new Error(error);
  }
};

exports.getCustomerById = async (req) => {
  let query = {};
  let params = re.query;
  if (params.id != "") {
    query.id = req.query.id;
  }
  if (params.clientId && params.clientId != "") {
    query.clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  let customer = {};
  try {
    customer = await Customer.findOne({
      where: query,
      include: [Person, Account],
    });

    return customer;
  } catch (error) {
    throw new Error(error);
  }
};
exports.getAllClient = async (req) => {
  let params = req.query;
  let query = {};
  try {
    if (params.contactNo && params.contactNo != "") {
      let person = await Person.findOne({
        where: { contactNo: params.contactNo, clientId: params.clientId },
      });
      query.personId = person.id;
    }
    if (params.code && params.code != "") {
      query.code = params.code;
    }
    if (params.shopName && params.shopName != "") {
      query.shopName = params.shopName;
    }
    if (params.companyName && params.companyName != "") {
      query.companyName = params.companyName;
    }
    if (params.brandName && params.brandName != "") {
      query.brandName = params.brandName;
    }
    if (params.employeeId && params.employeeId != "") {
      query.employeeId = params.employeeId;
    }
    if (params.designation && params.designation != "") {
      query.designation = params.designation;
    }
    if (params.role && params.role != "") {
      query.role = params.role;
    }
    if (params.clientId && params.clientId != "") {
      query.clientId = params.clientId;
    }
    let clientList = [];
    if (params.clientType == "CUSTOMER") {
      clientList = await Customer.findAll({
        where: query,
        include: [Person, Account],
      });
    } else if (params.clientType == "SUPPLYER") {
      clientList = await Supplyer.findAll({
        where: query,
        include: [Person, Account],
      });
    } else if (params.clientType == "EMPLOYEE") {
      clientList = await Employee.findAll({
        where: query,
        include: [Person, Account],
      });
    } else if (params.clientType == "LOAN_ACC") {
      clientList = await LoanClient.findAll({
        where: query,
        include: LoanAccount,
      });
    }
    return clientList;
  } catch (error) {
    throw new Error(error);
  }
};
exports.getPersonById = async (req) => {
  let query = {};
  if (req.query.id != "") {
    query.id = req.query.id;
  }
  if (req.query.clientId && req.query.clientId != "") {
    query.clientId = req.query.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  let client = {};
  try {
    client = await Person.findOne({
      where: query,
      include: [
        {
          model: Customer,
          include: { model: Account, include: AccountHistory },
        },
        {
          model: Supplyer,
          include: { model: Account, include: AccountHistory },
        },
        {
          model: Employee,
          include: { model: Account, include: AccountHistory },
        },
      ],
    });

    return client;
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateClient = async (req) => {
  let payload = req.body;
  let personModel;
  let updatedclient;
  let clientModel;
  let clientId;
  if (payload.clientId && payload.clientId != "") {
    clientId = payload.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    const result = await db.sequelize.transaction(async (t) => {
      personModel = {
        personName: payload.personName,
        personAddress: payload.personAddress,
        email: payload.email,
        nId: payload.nId,
        fatherName: payload.fatherName,
        clientId: clientId,
      };
      updatedPerson = await Person.update(
        personModel,
        { where: { id: payload.personId, clientId: clientId } },
        { transaction: t }
      );

      if (payload.clientType == "SUPPLYER") {
        clientModel = {
          companyName: payload.companyName,
          shopName: payload.shopName,
          brand: payload.brandName,
          regNo: payload.regNo,
          website: payload.website,
          clientId: clientId,
        };
        updatedclient = await Supplyer.update(
          clientModel,
          { where: { id: payload.supplyerId, clientId: clientId } },
          { transaction: t }
        );
      } else if (payload.clientType == "CUSTOMER") {
        clientModel = {
          shopName: payload.shopName,
          shopAddress: payload.shopAddress,
          clientId: clientId,
        };

        updatedclient = await Customer.update(
          clientModel,
          { where: { id: payload.customerId, clientId: clientId } },
          { transaction: t }
        );
      } else if (payload.clientType == "EMPLOYEE") {
        clientModel = {
          designation: payload.designation,
          joiningDate: payload.joiningDate,
          role: payload.role,
          clientId: clientId,
        };

        updatedclient = await Employee.update(
          clientModel,
          { where: { id: payload.employeeId, clientId: clientId } },
          { transaction: t }
        );
      }
    });

    return "Client Updated Successfully";
  } catch (error) {
    throw new Error(error);
  }
};

exports.getAccountHistoryByAccId = async (req) => {
  let query = {};
  let params = req.query;
  let accountHistories = [];
  let fromDate = new Date("2023-01-01");
  let toDate = new Date();
  toDate.setDate(toDate.getDate() + 1);
  if (params.fromDate || params.fromDate != "") {
    fromDate = new Date(params.fromDate);
  }
  if (params.toDate || params.toDate != "") {
    toDate = new Date(params.toDate);
  }
  if (params.tnxType && params.tnxType != "") {
    query.tnxType = params.tnxType;
  }
  if (params.accountId && params.accountId != "") {
    query.accountId = Number(params.accountId);
  }
  if (params.clientId && params.clientId != "") {
    query.clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  
  query.tnxDate = { [Op.between]: [fromDate, toDate] };
  try {
    accountHistories = await AccountHistory.findAll({ where: query });
    return accountHistories;
  } catch (error) {
    throw new Error(error.message);
  }
};
exports.getEmployeeByCodeOrID = async (req) => {
  let query = {};
  if (req.query.employeeId || req.query.employeeId != "") {
    query.employeeId = req.query.employeeId;
  }
  if (req.query.id || req.query.id != "") {
    query.id = req.query.id;
  }
  if (req.query.clientId && req.query.clientId != "") {
    query.clientId = req.query.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  let employee = {};
  try {
    employee = await Employee.findOne({
      where: query,
      include: [Person, { model: Account, include: AccountHistory }],
    });
    return employee;
  } catch (error) {
    throw new Error(error);
  }
};

exports.getClientByAccId = async (req) => {
  let query = {};
  let params = req.query;
  let client = {};
  if (params.accountId && params.accountId != "") {
    query.id = Number(params.accountId);
  }
  if (params.clientId && params.clientId != "") {
    query.clientId = params.clientId;
  } else {
    throw new Error("Client ID not provided");
  }
  try {
    client = await Account.findOne({
      where: query,
      include: [
        { model: Customer, include: Person },
        { model: Supplyer, include: Person },
      ],
    });
    return client;
  } catch (error) {
    throw new Error(error.message);
  }
};
