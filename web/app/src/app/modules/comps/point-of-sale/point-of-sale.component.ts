import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, Observable, startWith } from 'rxjs';
import { Account, Customer, OrderIssueDomain, OrderItem, Person, Product, Tasks } from '../../model/models';
import { ClientService } from '../../services/client.service';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';
import { PdfMakeService } from '../../services/pdf-make.service';
import { ProductService } from '../../services/product-service.service';

@Component({
  selector: 'app-point-of-sale',
  templateUrl: './point-of-sale.component.html',
  styleUrls: ['./point-of-sale.component.css']
})
export class PointOfSaleComponent implements OnInit {
    saleInvoiceIssueForm!: FormGroup;
    productFindForm!: FormGroup;
    isEdit: boolean = false;
    isCustomerExist: boolean = false;
    customer!: Customer;
    account: Account = new Account();
    productName = new FormControl('');
    selectedProduct = new Product();
    orderItem!: OrderItem;
    orderList!: any[];
    productList: any[] = [];
    filteredOptions!: Observable<Product[]>;
    unitType: string = 'UNIT';
    person: Person = new Person();
    personId!: number;
    showLoader: boolean = false;
    errMsg: string = '';
    totalPrice: number = 0;
    previousBalance: number = 0;
    totalPayableAmount: number = 0;
    balanceTitle: string = 'Balance';
    comment: string = '';
    isApprovalNeeded: boolean = true;
    userName: string = 'MANAGER';
    rebate: number = 0;
    paymentMethods : any [] = [];
    availableStock:number = 0;
    constructor(
      private route: Router,
      private formBuilder: FormBuilder,
      private clientService: ClientService,
      private productService: ProductService,
      private inventoryService: InventoryService,
      private notificationService: NotificationService,
      private pdfMakeService: PdfMakeService
    ) {
      this.customer = new Customer();
      this.customer.person = new Person();
      this.orderItem = new OrderItem();
      this.orderList = [];
      this.prepareInvoiceIssueForm(null);
      this.paymentMethods = [
        {label:"Select Payment Method", value:''},
        {label:"BANK", value:"BANK"},
        {label:"BKASH", value:"BKASH"},
        {label:"CASH", value:"CASH"},
      ]
    }
  
    ngOnInit(): void {
      this.fetchProducts();
    }
  
    getConfig(configname: any) {
      this.inventoryService.getConfigByName(configname).subscribe({
        next: (res) => {
          if (res.body && res.body.value == 1) {
            this.isApprovalNeeded = true;
          } else {
            this.isApprovalNeeded = false;
          }
        },
      });
    }
  
    initOptions() {
      this.filteredOptions = this.productName.valueChanges.pipe(
        startWith(''),
        map((value) => {
          const name = typeof value === 'string' ? value : value?.name;
          return name ? this._filter(name as string) : this.productList.slice();
        })
      );
    }
    prepareInvoiceIssueForm(formData: any) {
      if (!formData) {
        formData = new OrderIssueDomain();
      }
      this.saleInvoiceIssueForm = this.formBuilder.group({
        id: [formData.id],
        doNo: [formData.doNo],
        invoiceNo: [formData.invoiceNo],
        customerId: [formData.customerId, [Validators.required]],
        // accountId:[formData.accountId,[Validators.required]],
        orders: [formData.orders, [Validators.required]],
        productName: [new FormControl('')],
        totalPrice: [formData.totalPrice, [Validators.required]],
        previousBalance: [formData.previousBalance],
        totalPayableAmount: [formData.totalPayableAmount],
        totalPaidAmount: [formData.totalPaidAmount],
        duePayment: [formData.duePayment],
        rebate: [formData.rebate],
        paymentMethod : [formData.paymentMethod || ''],
        comment: [formData.comment],
      });
    }
    searchCustomer() {
      this.clientService.getClientByContactNo(this.person.contactNo).subscribe({
        next: (res) => {
          if (res.body) {
            this.notificationService.showMessage(
              'SUCCESS!',
              'Person Found',
              'OK',
              2000
            );
            this.person = res.body;
            console.log(res.body);
            if (res.body.customer) {
              this.customer = res.body.customer;
              this.account = this.customer.account;
              this.previousBalance = this.account.balance;
              if (this.account.balance < 0) {
                this.balanceTitle = 'Due';
              } else {
                this.balanceTitle = 'Balance';
              }
              this.saleInvoiceIssueForm
                .get('customerId')
                ?.setValue(this.customer.id);
              this.isCustomerExist = true;
            } else {
              this.errMsg =
                '** This person is not a Customer, Please Add as a Customer';
              this.isCustomerExist = false;
            }
          } else {
            this.person.personAddress = '';
            this.person.personName = '';
            this.person.id = 0;
            this.isCustomerExist = false;
            return;
          }
        },
        error: (err) => {
          this.isCustomerExist = false;
          console.log(err.message);
          this.notificationService.showMessage(
            'ERROR!',
            'Customer Found Failed' + err.message,
            'OK',
            2000
          );
        },
        complete: () => {},
      });
    }
    addCustomer() {
      const params: Map<string, any> = new Map();
      let customerModel = {
        personId: this.person.id,
        clientType: 'CUSTOMER',
        personName: this.person.personName,
        contactNo: this.person.contactNo,
        personAddress: this.person.personAddress,
        shopName: this.customer.shopName,
        // regNo: this.customer.regNo
      };
      params.set('client', customerModel);
  
      this.clientService.addClient(params).subscribe({
        next: (res) => {
          if (res.body) {
            this.isCustomerExist = true;
            this.saleInvoiceIssueForm.get('customerId')?.setValue(res.body.id);
            console.log(res.body);
          }
          this.errMsg ="";
          this.notificationService.showMessage(
            'SUCCESS!',
            'Client Add Successful',
            'OK',
            1000
          );
        },
      });
    }
    fetchProducts() {
      const params: Map<string, any> = new Map();
      this.productService.fetchAllProductForDropDown().subscribe({
        next: (res) => {
          this.productList = res.body;
          this.initOptions();
          // this.notificationService.showMessage("SUCCESS!","Product gets Successfully","OK",1000);
        },
        error: (err) => {
          this.notificationService.showMessage(
            'ERROR!',
            'Product Getting Failed',
            'OK',
            1000
          );
        },
      });
    }
    displayFn(product: Product): string {
      return product && product.productName ? product.productName : '';
    }
    private _filter(name: string): any[] {
      const filterValue = name.toLowerCase();
      return this.productList.filter((product) =>
        product.productName.toLowerCase().includes(filterValue)
      );
    }
    productSelected(event: any) {
      this.selectedProduct = event.option.value;
      this.orderItem.productId = this.selectedProduct.id;
      this.orderItem.productName = this.selectedProduct.productName;
      this.orderItem.unitType = this.selectedProduct.unitType;
      this.orderItem.packagingCategory = this.selectedProduct.packagingCategory;
      this.orderItem.unitPerPackage = this.selectedProduct.unitPerPackage;
      this.orderItem.pricePerUnit = this.selectedProduct.sellingPricePerUnit;
      this.orderItem.buyingPricePerUnit = this.selectedProduct.costPricePerUnit;
      this.orderItem.quantity = this.selectedProduct.quantity;
      this.unitType = this.selectedProduct.unitType;
      this.availableStock = this.selectedProduct.quantity;
  
      console.log(this.selectedProduct);
    }
    calculateOrder() {
      this.orderItem.totalOrderPrice =
        this.orderItem.quantityOrdered * this.orderItem.pricePerUnit;
    }
    calculateQuantity() {
      this.orderItem.quantityOrdered =
        this.orderItem.packageQuantity * this.orderItem.unitPerPackage +
        this.orderItem.looseQuantity;
      this.calculateOrder();
    }
    calculateSummary() {
      this.totalPayableAmount = 
      this.totalPrice - this.previousBalance - this.saleInvoiceIssueForm.get('rebate')?.value;
    }
    // testing
    onChangeProduc() {
      console.log(this.selectedProduct);
    }
    addOrder() {
      if (
        !this.orderItem.productId ||
        !this.orderItem.quantityOrdered ||
        !this.orderItem.pricePerUnit
      ) {
        return;
      }
      this.orderList.push(this.orderItem);
      this.orderItem = new OrderItem();
      this.productName = new FormControl('');
      this.initOptions();
      let totalPrice = 0;
      this.orderList.map((elem) => {
        totalPrice += elem.totalOrderPrice;
      });
      this.saleInvoiceIssueForm.get('orders')?.setValue(this.orderList);
      this.saleInvoiceIssueForm.get('totalPrice')?.setValue(totalPrice);
      this.totalPrice = totalPrice;
      this.totalPayableAmount = this.totalPrice - this.previousBalance;
    }
    calculateTotalPrice() {
      let totalPrice = 0;
      this.orderList.forEach((element) => {
        totalPrice = +element.totalOrderPrice;
      });
      this.saleInvoiceIssueForm.get('totalPrice')?.setValue(totalPrice);
    }
    submitOrder() {
      if (!this.saleInvoiceIssueForm.valid) {
        this.notificationService.showMessage(
          'INVALID FORM!',
          'Please Input all fields',
          'OK',
          1000
        );
        return;
      }
      let orderIssueModel = this.saleInvoiceIssueForm.value;
      orderIssueModel.accountId = this.account.id;
      orderIssueModel.comment = this.comment;
      orderIssueModel.totalPayableAmount = this.totalPayableAmount;
      orderIssueModel.previousBalance = this.account.balance;
      console.log(orderIssueModel);
      const params: Map<string, any> = new Map();
  
      if (this.isApprovalNeeded) {
        let approvalModel = {
          payload: JSON.stringify(orderIssueModel),
          createdBy: this.userName,
          taskType: Tasks.CREATE_INVOICE,
        };
        const params: Map<string, any> = new Map();
        params.set('approval', approvalModel);
        this.inventoryService.sendToApproval(params).subscribe({
          next: (res) => {
            this.notificationService.showMessage(
              'SUCCESS!',
              'Approval Sent',
              'OK',
              500
            );
          this.route.navigate(["/layout/sale/sale-invoice-list"]);
          },
          error: (err) => {
            this.notificationService.showMessage(
              'Failed!',
              'Approval Sending Failed. ' + err.message,
              'OK',
              500
            );
          },
        });
      } else {
        params.set('invoice', orderIssueModel);
        this.inventoryService.issueSalesOrder(params).subscribe({
          next: (res) => {
            console.log(res.body);
            this.notificationService.showMessage(
              'SUCCESS!',
              'Invoice Created',
              'OK',
              500
            );
            this.route.navigate(['/layout/sale/sale-invoice-list']);
          },
          error: (err) => {
            console.log(err);
            this.notificationService.showMessage(
              'ERROR!',
              'Invoice Not Created',
              'OK',
              500
            );
          },
        });
      }
    }
    downloadInvoice() {
      let orders: any[] = [];
      let index = 1;
      this.orderList.forEach((elem) => {
        let orderRow = [];
        orderRow.push(index);
        orderRow.push(elem.productName);
        orderRow.push(elem.pricePerUnit);
        orderRow.push(elem.quantityOrdered + ' ' + elem.unitType);
        orderRow.push(elem.totalOrderPrice);
        index++;
        orders.push(orderRow);
      });
      let invoiceModel = {
        doNo: '5853',
        invoiceId: 'INV#0001',
        customerName: this.person.personName,
        customerAddress: this.person.personAddress,
        totalPrice: this.totalPrice,
        previousBalance: this.previousBalance,
        totalPayableAmount: this.totalPayableAmount,
        totalPaid: this.saleInvoiceIssueForm.get('totalPaidAmount')?.value,
        orders: orders,
      };
      this.pdfMakeService.downloadSaleInvoice(invoiceModel);
    }
  }
