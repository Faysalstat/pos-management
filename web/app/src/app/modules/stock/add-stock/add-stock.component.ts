import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToWords } from 'to-words';
import {
  COFIGS,
  OrderItem,
  Person,
  Product,
  Supplyer,
  SupplyIssueDomain,
  Tasks} from '../../model/models';
import { ClientService } from '../../services/client.service';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';
import { PdfMakeService } from '../../services/pdf-make.service';
import { ProductService } from '../../services/product-service.service';

@Component({
  selector: 'app-add-stock',
  templateUrl: './add-stock.component.html',
  styleUrls: ['./add-stock.component.css'],
})
export class AddStockComponent implements OnInit {
  supplyInvoiceIssueForm!: FormGroup;
  productFindForm!: FormGroup;
  isEdit: boolean = false;
  isSupplyerExist: boolean = false;
  supplyer!: Supplyer;
  person: Person = new Person();
  personId!: number;
  productName ='';
  selectedProduct = new Product();
  orderItem!: OrderItem;
  selectedOrderItem!: OrderItem;
  orderList!: any[];
  productList: any[] = [];
  filteredOptions!: any;
  unitType: string = 'UNIT';
  showLoader: boolean = false;
  errMsg: string = '';
  isApprovalNeeded : boolean = false;
  totalPrice:number = 0;
  subTotalPrice:number = 0;
  comment!:string;
  userName:any;
  toWords = new ToWords();
  constructor(
    private route: Router,
    private formBuilder: FormBuilder,
    private clientService: ClientService,
    private productService: ProductService,
    private inventoryService: InventoryService,
    private notificationService: NotificationService,
    private pdfMakeService:PdfMakeService
  ) {
    this.supplyer = new Supplyer();
    this.person = new Person();
    this.orderItem = new OrderItem();
    this.orderList = [];
    this.prepareInvoiceIssueForm(null);
  }

  ngOnInit(): void {
    this.fetchProducts();
    this.getConfig(COFIGS.STOCK_APPROVAL_NEEDED);
    this.userName = localStorage.getItem('username');
  }

  getConfig(configname:any){
    this.inventoryService.getConfigByName(configname).subscribe({
      next:(res)=>{
        if(res.body && res.body.value==1){
          this.isApprovalNeeded = true;
        }else{
          this.isApprovalNeeded = false;
        }
      }
    })
  }
  prepareInvoiceIssueForm(formData: any) {
    if (!formData) {
      formData = new SupplyIssueDomain();
    }
    this.supplyInvoiceIssueForm = this.formBuilder.group({
      id: [formData.id],
      supplyerId: [formData.supplyerId],
      orders: [formData.orders, [Validators.required]],
      schedules: [formData.schedules],
      productName: [formData.productName],
      productCode: [formData.productCode],
      totalPrice: [formData.totalPrice, [Validators.required]],
      rebate: [formData.rebate],
      comment: [formData.comment],
    });
  }
  searchSupllyer() {
    this.showLoader = true;
    const params: Map<string, any> = new Map();
    params.set("id","");
    params.set("code",this.supplyer.code);
    this.clientService.getSupplyerByCode(params).subscribe({
      next: (res) => {
        if (res.body) {
          this.notificationService.showMessage(
            'SUCCESS!',
            res.message,
            'OK',
            2000
          );
          this.supplyer = res.body;
          this.person = this.supplyer.person;
          this.isSupplyerExist = true;
          this.errMsg =''
        } else {
          this.notificationService.showMessage(
            'ERROR!',
            'Supplier Not Found',
            'OK',
            2000
          );
          this.errMsg = '** Supplyer Not Found, Add One';
          this.person.personAddress = '';
          this.person.personName = '';
          this.person.id = 0;
          this.isSupplyerExist = false;
          return;
        }
      },
      error: (err) => {
        this.isSupplyerExist = false;
        this.showLoader = false;
        this.notificationService.showMessage(
          'ERROR!',
          'Supplier Found Failed' + err.message,
          'OK',
          2000
        );
      },
      complete: () => {
        this.showLoader = false;
      },
    });
  }
  fetchProducts() {
    this.showLoader = true;
    const params: Map<string, any> = new Map();
    this.productService.fetchAllProductForDropDown().subscribe({
      next: (res) => {
        this.productList = res.body;
        this.filteredOptions = res.body;
      },
      error: (err) => {
        this.notificationService.showMessage(
          'ERROR!',
          'Product Getting Failed',
          'OK',
          1000
        );
      },
      complete: () => {
        this.showLoader = false;
      },
    });
  }
  private _filter(name: string): string[] {
    const filterValue = name.toLowerCase();
    return this.productList.filter((product) =>
      product.productName.toLowerCase().includes(filterValue)
    );
  }

  private _filterCode(code: string): string[] {
    const filterValue = code.toLowerCase();
    return this.productList.filter((product) =>
      product.productCode.toLowerCase().includes(filterValue)
    );
  }
  productSelected(event: any) {
    this.selectedProduct = event.option.value;
    this.supplyInvoiceIssueForm.get("productName")?.setValue(this.selectedProduct.productName);
    this.supplyInvoiceIssueForm.get("productCode")?.setValue(this.selectedProduct.productCode);
    this.orderItem.productId = this.selectedProduct.id;
    this.orderItem.productName = this.selectedProduct.productName;
    this.orderItem.productCode = this.selectedProduct.productCode;
    this.orderItem.unitType = this.selectedProduct.unitType;
    this.orderItem.pricePerUnit = this.selectedProduct.costPricePerUnit;
    this.orderItem.unitPerPackage = this.selectedProduct.unitPerPackage;
    this.unitType = this.selectedProduct.unitType;
  }
  calculateOrder() {
    this.orderItem.totalOrderPrice =
      +(Number(this.orderItem.quantityOrdered * this.orderItem.pricePerUnit).toFixed(2));
  }
  addSupplyOrder() {
    if (
      !this.orderItem.productId ||
      !this.orderItem.quantityOrdered ||
      !this.orderItem.pricePerUnit
    ) {
      return;
    }
    this.orderList.push(this.orderItem);
    this.orderItem = new OrderItem();
    this.productName = '';
    this.totalPrice = 0;
    this.orderList.map((elem) => {
      this.totalPrice += elem.totalOrderPrice;
    });
    this.supplyInvoiceIssueForm.get('orders')?.setValue(this.orderList);
    this.supplyInvoiceIssueForm.get('totalPrice')?.setValue(+(this.totalPrice).toFixed(2));
    this.supplyInvoiceIssueForm.get("productName")?.setValue('');
    this.supplyInvoiceIssueForm.get("productCode")?.setValue('');
    this.calculateSummary();
  }
  onOrderSelect(event: any) {
    console.log(event);
  }
  calculateSummary() {
    this.subTotalPrice = +(this.totalPrice - this.supplyInvoiceIssueForm.get('rebate')?.value).toFixed(2);
    // this.supplyInvoiceIssueForm.get('totalPrice')?.setValue(this.subTotalPrice);
  }
  submitOrder() {
    if (!this.isSupplyerExist) {
      this.notificationService.showMessage(
        'WARNING!',
        'Please Add Supplyer',
        'OK',
        10000
      );
      return;
    }
    if (!this.supplyInvoiceIssueForm.valid) {
      this.notificationService.showMessage(
        'INVALID FORM!',
        'Please Input all fields',
        'OK',
        1000
      );
      return;
    }
    this.showLoader = true;
    let orderIssueModel = this.supplyInvoiceIssueForm.value;
    orderIssueModel.supplyerId = this.supplyer.id;
    orderIssueModel.comment = this.comment;
    orderIssueModel.issuedBy = this.userName;
    if(this.isApprovalNeeded){
      let approvalModel = {
        payload:JSON.stringify(orderIssueModel),
        createdBy: this.userName,
        taskType: Tasks.CREATE_SUPPLY,
        status: "OPEN"
      };
      const params: Map<string, any> = new Map();
      params.set('approval', approvalModel);
      this.inventoryService.sendToApproval(params).subscribe({
        next:(res)=>{
          this.notificationService.showMessage(
            'SUCCESS!',
            'Approval Sent',
            'OK',
            2000
          );
          // this.downloadInvoice();
          this.route.navigate(['/layout/supply/supply-invoice-list']);
        },
        error:(err)=>{
          this.notificationService.showMessage(
            'Failed!',
            'Approval Sending Failed. '+ err.message,
            'OK',
            2000
          );
          this.showLoader = false;
        },
        complete:()=>{
          this.showLoader = false;
        }
      })
    }else{
      const params: Map<string, any> = new Map();
      params.set('order', orderIssueModel);
      this.inventoryService.issueBuyOrder(params).subscribe({
        next: (res) => {
          console.log(res.body);
          this.notificationService.showMessage(
            'SUCCESS!',
            'Invoice Created',
            'OK',
            2000
          );
          // this.downloadInvoice();
          this.route.navigate(['/layout/supply/supply-invoice-list']);
        },
        error: (err) => {
          console.log(err);
          this.notificationService.showMessage(
            'ERROR!',
            'Invoice Not Created',
            'OK',
            2000
          );
          this.showLoader = false;
        },
        complete:()=>{
          this.showLoader = false;
        }
      });
    }
    
  }
  calculateQuantity() {
    this.orderItem.quantityOrdered = (this.orderItem.packageQuantity * this.orderItem.unitPerPackage) + this.orderItem.looseQuantity;
    this.calculateOrder();
  }

  onProductNameInput(event: any) {
    if (event.target.value == '') {
      this.filteredOptions = this.productList;
    } else {
      this.filteredOptions = this._filter(event.target.value);
    }
  }

  onProductCodeInput(event: any) {
    if (event.target.value == '') {
      this.filteredOptions = this.productList;
    } else {
      this.filteredOptions = this._filterCode(event.target.value);
    }
  }
  downloadInvoice() {
    let orders: any[] = [];
    let index = 1;
    this.supplyer.person = this.person;
    this.orderList.forEach((elem: any) => {
      let orderRow = [];
      orderRow.push(index);
      orderRow.push(elem.productName);
      orderRow.push(elem.pricePerUnit);
      orderRow.push(elem.packageQuantity);
      orderRow.push(elem.looseQuantity);
      orderRow.push(elem.quantityOrdered + ' ' + elem.unitType);
      orderRow.push(elem.totalOrderPrice);
      index++;
      orders.push(orderRow);
    });
    let invoiceModel = {
      doNo: '',
      invoiceId: 'N/A',
      issuedBy: this.userName,
      supplyer: this.supplyer,
      tnxDate: this.applyFilter(new Date()),
      supplierName: this.person.personName,
      customerAddress: this.person.personAddress,
      totalPrice: this.totalPrice,
      balance: this.supplyer.account.balance,
      totalPayableAmount: this.subTotalPrice,
      totalPriceInWords: this.toWords.convert(this.totalPrice),
      discount: this.supplyInvoiceIssueForm.get('rebate')?.value,
      orders: orders,
    };
    this.pdfMakeService.downloadSupplyInvoice(invoiceModel);
  }
  applyFilter(date: any) {
    let newDate = new Date(date);
    return (
      newDate.getDate() +
      '/' +
      (newDate.getMonth() + 1) +
      '/' +
      newDate.getFullYear()
    );
  }
}
