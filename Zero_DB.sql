INSERT INTO `client` (`code`, `clientName`, `shopName`,`shopAddress`, `shopContactNo`, `createdAt`, `updatedAt`) 
VALUES ('01940240180', 'Nazmul Hasan', 'Baby Shop', 'Talukdar Bazar, Homna, Cumilla', '01940240180', NOW(), now());

INSERT INTO `glAccount`(`glName`, `balance`,`clientId`, `glType`, `createdAt`, `updatedAt`) VALUES 
('ASSET_GL',0,1, null, NOW(), now()),
('EXPENSE_GL',0,1, null, NOW(), now()),
('LIABILITY_GL',0,1, null, NOW(), now()),
('INCOME_GL',0,1, null, NOW(), now());


INSERT INTO account (balance, accountType, category, clientId, createdAt, updatedAt, glAccountId)
VALUES 
(0,'CashGL','GL',1, now(), now(), 1),
(0,'AssetGL','GL',1, now(), now(),1),
(0,'ProductGL','GL',1, now(), now(),1),
(0,'ExpenseGL','GL',1, now(), now(),2),
(0,'IncomeGL','GL',1, now(), now(),4),
(0,'ExtraChargeGL','GL',1, now(), now(),4),
(0,'DrawingGL','GL',1, now(), now(),1),
(0,'InvestmentGL', 'GL',1, now(), now(), 3),
(0, 'CustomerReturnGL', 'GL', 1, '2025-04-15 16:04:45', '2025-04-15 15:47:21', 1),
(0, 'SupplierReturnGL', 'GL', 1, '2025-04-15 16:04:45', '2025-04-15 15:47:21', 3);




INSERT INTO `appconfig` (`configName`, `value`, `clientId`, `createdAt`, `updatedAt`) VALUES 
('STOCK_APPROVAL_NEEDED', '0', 1, NOW(), NOW()), 
('SALE_APPROVAL_NEEDED', '0', 1, NOW(), NOW()), 
('TRANSACTION_APPROVAL_NEEDED', '0', 1, NOW(), NOW()),
('EXPENSE_APPROVAL_NEEDED', '0', 1, NOW(), NOW()),
('SHOP_NAME', 'Baby Shop', 1, NOW(), NOW());


INSERT INTO `person` (`personName`, `contactNo`, `personAddress`, `clientId`, `createdAt`, `updatedAt`) VALUES ('Md Monir Hossain', '01721558135','Homna, Cumilla',1, NOW(), NOW());

INSERT INTO `user` (`userName`, `password`, `userRole`, `email`, `personId`,`clientId`, `createdAt`, `updatedAt`) 
VALUES ('01721558135', '$2b$10$AubZYRvezCS4SKy4Rkkrie8QesC.CsRjZUlygfq1Ydl.iBsLumehq', 'ADMIN', 'moniraiub123@gmail.com',1,1, NOW(), NOW());

