-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate all tables including client and person
TRUNCATE TABLE accountHistory;
TRUNCATE TABLE account;
TRUNCATE TABLE appconfig;
TRUNCATE TABLE approvalflow;
TRUNCATE TABLE assets;
TRUNCATE TABLE brandName;
TRUNCATE TABLE clientModule;
TRUNCATE TABLE customer;
TRUNCATE TABLE employee;
TRUNCATE TABLE expenseCategory;
TRUNCATE TABLE glAccount;
TRUNCATE TABLE loanAccount;
TRUNCATE TABLE loanClient;
TRUNCATE TABLE `order`;
TRUNCATE TABLE packagingCategory;
TRUNCATE TABLE product;
TRUNCATE TABLE productCategory;
TRUNCATE TABLE saleDeliveryHistories;
TRUNCATE TABLE saleInvoice;
TRUNCATE TABLE supplyDeliveryHistories;
TRUNCATE TABLE supplyInvoice;
TRUNCATE TABLE supplyOrder;
TRUNCATE TABLE supplyer;
TRUNCATE TABLE transactionReason;
TRUNCATE TABLE transactionRegistry;
TRUNCATE TABLE unitType;
TRUNCATE TABLE `user`;

-- Now truncate client and person tables
TRUNCATE TABLE client;
TRUNCATE TABLE person;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;


