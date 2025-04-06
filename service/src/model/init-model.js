
const Person = require('./person')
const Account  = require("./account")
const Customer = require("./customer");
const Supplyer = require('./supplyer');
const Product = require('./product');
const SaleInvoice = require('./saleInvoice');
const Order = require('./order');
const SupplyInvoice = require('./supplyInvoice');
const SupplyOrder = require('./supplyOrder');
const AccountHistory = require('./accountHistory');
const SupplyDeliveryHistory = require('./supplyDeliveryHistory');
const SaleDeliveryHistory = require('./saleDeliveryHistory');
const User = require('./user');
const Employee = require('./employee');
const GlAccount = require('./glAccounts');
const TransactionRegistry = require('./transactionRegistry');
const LoanClient = require('./loanClient');
const LoanAccount = require('./loanAcc');
const Client = require('./client');
const AppConfig = require('./appConfig');
const ExpenseCategory = require('./expenseCategory');
const PackagingCategory = require('./packagingCategory');
const ProductCategory = require('./productCategory');

Person.hasOne(Customer);
Customer.belongsTo(Person);

Account.hasOne(Customer);
Customer.belongsTo(Account);

Supplyer.belongsTo(Account);
Account.hasOne(Supplyer);

Person.hasOne(Supplyer);
Supplyer.belongsTo(Person);

Person.hasOne(User);
User.belongsTo(Person);

SaleInvoice.hasMany(Order);
Order.belongsTo(SaleInvoice);

Customer.hasMany(SaleInvoice);
SaleInvoice.belongsTo(Customer);

Product.hasMany(Order);
Order.belongsTo(Product);

SupplyInvoice.hasMany(SupplyOrder);
SupplyOrder.belongsTo(SupplyInvoice);

Product.hasMany(SupplyOrder);
SupplyOrder.belongsTo(Product);

Supplyer.hasMany(SupplyInvoice);
SupplyInvoice.belongsTo(Supplyer);

Account.hasMany(AccountHistory);
AccountHistory.belongsTo(Account);

SaleInvoice.hasOne(SaleDeliveryHistory);
SaleDeliveryHistory.belongsTo(SaleInvoice);

Product.hasMany(SaleDeliveryHistory);
SaleDeliveryHistory.belongsTo(Product);

SupplyInvoice.hasOne(SupplyDeliveryHistory);
SupplyDeliveryHistory.belongsTo(SupplyInvoice);

Product.hasMany(SupplyDeliveryHistory);
SupplyDeliveryHistory.belongsTo(Product);

Person.hasOne(Employee);
Employee.belongsTo(Person);

Account.hasOne(Employee);
Employee.belongsTo(Account);


GlAccount.hasMany(Account);
Account.belongsTo(GlAccount);
TransactionRegistry.belongsTo(Account,{
    foreignKey:"accountNo",
    targetKey:"id"
})

LoanClient.hasMany(LoanAccount);
LoanAccount.belongsTo(LoanClient);

Account.hasOne(LoanAccount);
LoanAccount.belongsTo(Account);

Client.hasOne(User);
User.belongsTo(Client);



module.exports ={
    Person,Account,Customer,SaleInvoice,SupplyOrder
}