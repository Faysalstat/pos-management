export class Person {
  id!: number;
  customer!:Customer;
  personName!: string;
  contactNo!: string;
  personAddress!: string;
  email!: string;
  fatherName!:string;
  nId!:string;
}
export class Customer {
  id!: number;
  person!: Person;
  account!:Account;
  shopName!: string;
  shopAddress!:string;
}

export class Supplyer {
  id!: number;
  person!: Person;
  account!:Account;
  code!:string;
  companyName!: string;
  brand!: string;
  shopName!: string;
  regNo!:string;
  website!:string;
}
export class Employee {
  id!: number;
  person!: Person;
  account!:Account;
  employeeId!: string;
  designation!:string;
  role!:string;
  joiningDate: Date = new Date();
}
export class LoanClient {
  id!: number;
  account!:LoanAccount[];
  clientName!: string;
  clientDisc!: string;
  
};
export class LoanAccount {
  id!: number;
  balance!: number;
  accountType!: string;
  interestRate!: number;
  receiveDate!: Date;
  returnDate!: Date;
  period!: number;
  remark!: string
}
export class Account {
  id!: number;
  balance: number = 0;
  due: number=0;
  amountToPay!: number;
  accountType!: number;
  accountHistory:any[]=[];
}
export class Product {
  id!: number;
  productName!: string;
  productCode!: string;
  unitType!: string;
  quantity!: number;
  quantitySold!: number;
  costPricePerUnit!: number;
  sellingPricePerUnit!: number;
  packagingCategory!: string;
  unitPerPackage!: number;
}
export class OrderItem {
  id!: number;
  productId!: number;
  productName!: string;
  productCode!: string;
  unitType!: string;
  packagingCategory!: string;
  unitPerPackage: number = 0;
  packageQuantity: number = 0;
  looseQuantity: number = 0;
  quantityOrdered: number = 0;
  quantitySold: number = 0;
  pricePerUnit: number = 0;
  buyingPricePerUnit: number = 0;
  totalOrderPrice!: number;
  totalOrderCost!: number;
  deliveredQuantity!:number;
  deliverySchedules!:ScehduleDelivery[];
  quantity:number = 0;
  quantityReturned:number =0;
}
export class ScehduleDelivery{
  id!:number;
  deliverableQuantity!:number;
  scheduledDate: Date = new Date();
  deliveryStatus!: string;
  state!: string;
  orderId!:number;
}

export class OrderIssueDomain {
  id!: number;
  doNo!: string;
  invoiceNo!:string;
  customerId!: number;
  accountId!: number;
  productName!:string;
  productCode!:string;
  orders!: OrderItem[];
  totalPrice!: number;
  previousBalance!:number;
  totalPayableAmount!: number;
  totalPaidAmount!: number;
  duePayment: number = 0;
  rebate!:number;
  chargeReason!:string;
  extraCharge!:number;
  paymentMethod!:string;
  comment!: string;
}
export class SupplyIssueDomain {
  id!: number;
  supplyerId!: number;
  productName!:string;
  productCode!:string;
  orders!: OrderItem[];
  schedules!:ScehduleDelivery[];
  totalPrice!: number;
  amountPaid!: number;
  duePayment!: number;
  rebate!: number;
  newPayment!: number;
  comment!: string;
}
 
export class ClientIssueModel {
  companyName!: string;
  shopName!: string;
  code!: string;
  regNo!: string;
  brandName!: string;
  contactNo!: string;
  website!: string;
  personName!:string;
  personAddress!:string;
  email!:string;

}

export class User{
  userName:string='';
  password:string = '';
  userRole:string ='';
}
export class UserModel{
  id!:number;
  personId!:number;
  personName!: string;
  contactNo!: string;
  personAddress!: string;
  email!: string;
  userName!:string;
  password!:string;
  userRole!:string;
}
export enum Roles{
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SALER = 'SALER',
  DEVELOPER = 'DEVELOPER'
}
export enum Tasks{
  CREATE_INVOICE="CREATE_INVOICE",
  UPDATE_INVOICE= "UPDATE_INVOICE",
  CREATE_SUPPLY= "CREATE_SUPPLY",
  UPDATE_SUPPLY= "UPDATE_SUPPLY",
  CASH_HANDOVER = "CASH_HANDOVER",
  // CASH_PAYMENT = "CASH_PAYMENT",
  PAYMENT_TRANSACTION = "PAYMENT_TRANSACTION",
  DEPOSIT_TRANSACTION = "DEPOSIT_TRANSACTION",
  CREATE_LOAN = "CREATE_LOAN",
  EXPENSE_TRANSACTION = "EXPENSE_TRANSACTION",
  SALARY_TRANSACTION = "SALARY_TRANSACTION",
  // SALARY_TRANSACTION = "SALARY_TRANSACTION",
}


export enum COFIGS{
  STOCK_APPROVAL_NEEDED = "STOCK_APPROVAL_NEEDED",
  SALE_APPROVAL_NEEDED = "SALE_APPROVAL_NEEDED",
  TRANSACTION_APPROVAL_NEEDED = "TRANSACTION_APPROVAL_NEEDED",
  EXPENSE_APPROVAL_NEEDED = "EXPENSE_APPROVAL_NEEDED",
  SHOP_NAME = "SHOP_NAME"
}
export const CLIENT_ID = 1;

export class ReceiptBody {
  invoiceNo!: string;
  customerName!: string;
  cutomerContact!: string;
  orders!: IOrderBody[];
  subTotal!: number;
  tax!: number;
  discount!: number;
  total!: number;
  issuedBy!: string;
  extraCharge?: number; 
  extraChargeReason?: string; 
}
export interface IOrderBody{
  item:string;
  rate:number;
  qty:number;
  total:number;

}