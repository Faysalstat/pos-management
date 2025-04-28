import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  OnInit,
  ViewChild,
  HostListener,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToWords } from 'to-words';
import {
  Account,
  COFIGS,
  Customer,
  ReceiptBody,
  OrderIssueDomain,
  OrderItem,
  Person,
  Product,
  Tasks,
} from '../../model/models';
import { ClientService } from '../../services/client.service';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';
import { PdfMakeService } from '../../services/pdf-make.service';
import { ProductService } from '../../services/product-service.service';
import { Modal } from 'bootstrap'; // This line is only needed if you're importing Bootstrap in a module format
import { Router } from '@angular/router';



const openModal = () => {
  const myModal = new Modal(document.getElementById('myModal')!);
  myModal.show();
};

const closeModal = () => {
  const myModal = new Modal(document.getElementById('myModal')!);
  myModal.dispose();
};

@Component({
  selector: 'app-sale-point',
  templateUrl: './sale-point.component.html',
  styleUrls: ['./sale-point.component.css'],
})
export class SalePointComponent implements OnInit {
  @ViewChild('productCodeInput') productCodeInput!: ElementRef;
barcodeScannerActive = false;
barcodeInput = '';
barcodeTimeout: any;
  @ViewChild('receiptComponent', { static: false, read: ElementRef })
  PrintableReceiptComponent!: ElementRef;

  saleInvoiceIssueForm!: FormGroup;
  productFindForm!: FormGroup;
  isEdit: boolean = false;
  isCustomerExist: boolean = false;
  customer!: Customer;
  account: Account = new Account();
  selectedProductCode!: string;
  selectedProduct = new Product();
  orderItem!: OrderItem;
  orderList!: any[];
  productList: any[] = [];
  filteredOptions!: any;
  filteredCodeOptions!: any;
  unitType: string = 'UNIT';
  person: Person = new Person();
  personId!: number;
  showLoader: boolean = false;
  errMsg: string = '';
  totalPrice: number = 0;
  previousBalance: number = 0;
  totalPayableAmount: number = 0;
  totalDueAmount: number = 0;
  balanceTitle: string = 'Balance';
  comment: string = '';
  isApprovalNeeded: boolean = true;
  userName: any;
  rebate: number = 0;
  paymentMethods: any[] = [];
  availableStock: number = 0;
  balanceType: string = 'Payable';
  productCode: string = '';
  toWords = new ToWords();
  isLengthError: boolean = false;
  customerBalanceStatus: string = 'Due';
  isWalkingCustomer: boolean = true;
  stockMsg = '';
  receiptModel: ReceiptBody = new ReceiptBody();
  shopName: string;
  shopAddress!: string;
  shopContactNo!: string;
  tnxDate: Date = new Date();
  customerType: string = 'Walk-IN Customer';
  isSubmitting: boolean = false;
  // @HostListener('document:keydown.enter', ['$event'])
  // handleEnterKey(event: KeyboardEvent) {
  //   // 1. Prevent default form submission behavior
  //   event.preventDefault();

  //   // 2. Check if button would be enabled
  //   if (this.canAddOrder()) {
  //     // 3. Execute the add order action
  //     this.addOrder();
  //   }
  // }
  constructor(
    private formBuilder: FormBuilder,
    private clientService: ClientService,
    private productService: ProductService,
    private inventoryService: InventoryService,
    private notificationService: NotificationService,
    private pdfMakeService: PdfMakeService
  ) {
    this.shopName = localStorage.getItem('shopName') || '';
    this.shopAddress = localStorage.getItem('shopAddress') || '';
    this.shopContactNo = localStorage.getItem('shopContactNo') || '';
    this.customer = new Customer();
    this.customer.person = new Person();
    this.orderItem = new OrderItem();
    this.orderList = [];
    this.prepareInvoiceIssueForm(null);
    this.paymentMethods = [
      { label: 'Select Payment Method', value: '' },
      { label: 'BANK', value: 'BANK' },
      { label: 'BKASH', value: 'BKASH' },
      { label: 'CASH', value: 'CASH' },
    ];
  }

  // ngOnInit(): void {
  //   this.fetchProducts();
  //   this.getConfig(COFIGS.SALE_APPROVAL_NEEDED);
  //   this.userName = localStorage.getItem('personName') || '';
  //   this.receiptModel.invoiceNo = 'NA';
  //   this.receiptModel.orders = [];
  //   this.receiptModel.subTotal = 0;
  //   this.receiptModel.total = 0;
  //   this.receiptModel.discount = 0;
  //   this.receiptModel.issuedBy = this.userName || '';
  //   openModal();
  //   // console.log(this.toWords.convert(1239271392))

  //   // Auto-focus barcode input on page load
  // setTimeout(() => {
  //   if (this.productCodeInput) {
  //     this.productCodeInput.nativeElement.focus();
  //   }
  // }, 500);
  // }

  ngOnInit(): void {
    this.fetchProducts();
    this.getConfig(COFIGS.SALE_APPROVAL_NEEDED);
    this.userName = localStorage.getItem('personName') || '';
    this.receiptModel.invoiceNo = 'NA';
    this.receiptModel.orders = [];
    this.receiptModel.subTotal = 0;
    this.receiptModel.total = 0;
    this.receiptModel.discount = 0;
    this.receiptModel.issuedBy = this.userName || '';
  
    // Auto-focus barcode input on page load
    setTimeout(() => {
      if (this.productCodeInput) {
        this.productCodeInput.nativeElement.focus();
      }
    }, 500);
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

  onProductNameInput(event: any) {
    if (event.target.value == '') {
      this.filteredOptions = this.productList;
    } else {
      this.filteredOptions = this._filter(event.target.value);
    }
  }

  // onProductCodeInput(event: any) {
  //   if (event.target.value == '') {
  //     this.filteredCodeOptions = this.productList;
  //   } else {
  //     this.filteredCodeOptions = this._filterCode(event.target.value);
  //   }
  // }

  onProductCodeInput(event: any) {
    const inputValue = event.target.value;
    if (inputValue === '') {
        return;
    }
    
    // Find product by code
    const product = this.productList.find(p => 
        p.productCode.toLowerCase() === inputValue.toLowerCase()
    );
    
    if (product) {
        this.productSelected({ value: product });
    }
}

  prepareInvoiceIssueForm(formData: any) {
    if (!formData) {
      formData = new OrderIssueDomain();
    }
    this.saleInvoiceIssueForm = this.formBuilder.group({
      id: [formData.id],
      doNo: [formData.doNo],
      invoiceNo: [formData.invoiceNo],
      customerId: [formData.customerId],
      // accountId:[formData.accountId,[Validators.required]],
      orders: [formData.orders, [Validators.required]],
      productName: [formData.productName],
      productCode: [formData.productCode],
      totalPrice: [formData.totalPrice, [Validators.required]],
      totalCost: [formData.totalCost],
      previousBalance: [formData.previousBalance],
      totalPayableAmount: [formData.totalPayableAmount],
      totalPaidAmount: [formData.totalPaidAmount],
      duePayment: [formData.duePayment],
      rebate: [formData.rebate],
      paymentMethod: [formData.paymentMethod || 'CASH'],
      comment: [formData.comment],
      extraCharge: [formData.extraCharge],
      chargeReason: [formData.chargeReason],
    });
    // this.saleInvoiceIssueForm.get('duePayment')?.disable();
    this.saleInvoiceIssueForm
      .get('duePayment')
      ?.valueChanges.subscribe((data) => {
        this.totalDueAmount = data;
        if (data < 0) {
          this.customerBalanceStatus = 'Balance';
        } else {
          this.customerBalanceStatus = 'Due';
        }
      });
    this.saleInvoiceIssueForm
      .get('totalPaidAmount')
      ?.valueChanges.subscribe((data) => {
        this.saleInvoiceIssueForm
          .get('duePayment')
          ?.setValue(this.totalPayableAmount - data);
      });
  }
  searchCustomer() {
    if (this.person.contactNo.length < 11) {
      this.isLengthError = true;
      return;
    } else {
      this.isLengthError = false;
    }
    this.showLoader = true;
    this.clientService.getClientByContactNo(this.person.contactNo).subscribe({
      next: (res) => {
        if (res.body) {
          this.notificationService.showMessage(
            'SUCCESS!',
            'Person Found',
            'OK',
            100
          );
          this.person = res.body;
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
            this.receiptModel.customerName =
              this.customer.person.personName || '';
            this.receiptModel.cutomerContact =
              this.customer.person.contactNo || '';
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
        this.notificationService.showMessage(
          'ERROR!',
          'Customer Found Failed' + err.message,
          'OK',
          2000
        );
      },
      complete: () => {
        this.showLoader = false;
      },
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
          this.receiptModel.customerName = this.person.personName || '';
          this.receiptModel.cutomerContact = this.person.contactNo || '';
          console.log(res.body);
        }
        this.errMsg = '';
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
        this.filteredOptions = res.body;
        this.filteredCodeOptions = res.body;
        this.productList = res.body;
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

  // productSelected(event: any) {
  //   this.selectedProduct = event.option.value;
  //   this.saleInvoiceIssueForm
  //     .get('productCode')
  //     ?.setValue(this.selectedProduct.productCode);
  //   this.saleInvoiceIssueForm
  //     .get('productName')
  //     ?.setValue(this.selectedProduct.productName);
  //   this.orderItem.productId = this.selectedProduct.id;
  //   this.orderItem.productCode = this.selectedProduct.productCode;
  //   this.orderItem.productName = this.selectedProduct.productName;
  //   this.orderItem.unitType = this.selectedProduct.unitType;
  //   this.orderItem.packagingCategory = this.selectedProduct.packagingCategory;
  //   this.orderItem.unitPerPackage = this.selectedProduct.unitPerPackage;
  //   this.orderItem.pricePerUnit = this.selectedProduct.sellingPricePerUnit;
  //   this.orderItem.buyingPricePerUnit = this.selectedProduct.costPricePerUnit;
  //   this.orderItem.quantity = this.selectedProduct.quantity;
  //   this.unitType = this.selectedProduct.unitType;
  //   // this.availableStock =
  //   //this.selectedProduct.quantity - this.selectedProduct.quantitySold;
  //   this.availableStock = this.selectedProduct.quantity;

  //   // Set default quantity to 1 if product is available
  //   if (this.availableStock > 0) {
  //     this.orderItem.looseQuantity = 1;
  //     this.orderItem.packageQuantity = 0; // Reset package quantity
  //     this.calculateQuantity(); // This will calculate the total price
  //   } else {
  //     this.orderItem.looseQuantity = 0;
  //     this.orderItem.totalOrderPrice = 0;
  //   }
  // }

  productSelected(event: any) {
    // Handle both manual selection and barcode scan
    const selectedProduct = event.option ? event.option.value : event.value;
    
    if (!selectedProduct) return;
  
    this.selectedProduct = selectedProduct;
    this.saleInvoiceIssueForm.get('productCode')?.setValue(this.selectedProduct.productCode);
    this.saleInvoiceIssueForm.get('productName')?.setValue(this.selectedProduct.productName);
    
    this.orderItem.productId = this.selectedProduct.id;
    this.orderItem.productCode = this.selectedProduct.productCode;
    this.orderItem.productName = this.selectedProduct.productName;
    this.orderItem.unitType = this.selectedProduct.unitType;
    this.orderItem.packagingCategory = this.selectedProduct.packagingCategory;
    this.orderItem.unitPerPackage = this.selectedProduct.unitPerPackage;
    this.orderItem.pricePerUnit = this.selectedProduct.sellingPricePerUnit;
    this.orderItem.buyingPricePerUnit = this.selectedProduct.costPricePerUnit;
    this.orderItem.quantity = this.selectedProduct.quantity;
    this.unitType = this.selectedProduct.unitType;
    this.availableStock = this.selectedProduct.quantity;
  
    // Set default quantity to 1 if product is available
    if (this.availableStock > 0) {
      this.orderItem.looseQuantity = 1;
      this.orderItem.packageQuantity = 0;
      this.calculateQuantity();
    } else {
      this.orderItem.looseQuantity = 0;
      this.orderItem.totalOrderPrice = 0;
    }
  
    // Focus on quantity field after selection
    setTimeout(() => {
      const quantityInput = document.querySelector('input[formControlName="looseQuantity"]') as HTMLInputElement;
      if (quantityInput) {
        quantityInput.focus();
        quantityInput.select();
      }
    }, 50);
  }

  onCodeInput() {
    this.productList.map((product) => {
      if (product.productCode == this.selectedProductCode) {
        this.selectedProduct = product;
      }
    });
    // this.selectedProduct = event.option.value;
    this.saleInvoiceIssueForm
      .get('productCode')
      ?.setValue(this.selectedProduct.productCode);
    this.saleInvoiceIssueForm
      .get('productName')
      ?.setValue(this.selectedProduct.productName);
    this.orderItem.productId = this.selectedProduct.id;
    this.orderItem.productCode = this.selectedProduct.productCode;
    this.orderItem.productName = this.selectedProduct.productName;
    this.orderItem.unitType = this.selectedProduct.unitType;
    this.orderItem.packagingCategory = this.selectedProduct.packagingCategory;
    this.orderItem.unitPerPackage = this.selectedProduct.unitPerPackage;
    this.orderItem.pricePerUnit = this.selectedProduct.sellingPricePerUnit;
    this.orderItem.buyingPricePerUnit = this.selectedProduct.costPricePerUnit;
    this.orderItem.quantity = this.selectedProduct.quantity;
    this.unitType = this.selectedProduct.unitType;
    this.availableStock =
      this.selectedProduct.quantity - this.selectedProduct.quantitySold;
  }
  calculateOrder() {
    this.orderItem.totalOrderPrice = +(
      this.orderItem.quantityOrdered * this.orderItem.pricePerUnit
    ).toFixed(2);
    this.orderItem.totalOrderCost = +(
      this.orderItem.quantityOrdered * this.orderItem.buyingPricePerUnit
    ).toFixed(2);
  }
  // calculateQuantity() {
  //   if (!this.orderItem.productId) {
  //     this.orderItem.quantityOrdered = 0;
  //     this.orderItem.totalOrderPrice = 0;
  //     return;
  //   }

  //   // this.orderItem.quantityOrdered = +(
  //   //   this.orderItem.packageQuantity * this.orderItem.unitPerPackage +
  //   //   +this.orderItem.looseQuantity
  //   // ).toFixed(2);
  //   // this.checkQuantity();
  //   // this.calculateOrder();
  //   const packageQty = Number(this.orderItem.packageQuantity) || 0;
  //   const looseQty = Number(this.orderItem.looseQuantity) || 0;
  //   const unitsPerPackage = Number(this.orderItem.unitPerPackage) || 1;

  //   this.orderItem.quantityOrdered = +(
  //     packageQty * unitsPerPackage +
  //     looseQty
  //   ).toFixed(2);
  //   this.checkQuantity();
  //   this.calculateOrder();
  // }

  calculateQuantity() {
    if (!this.orderItem.productId) {
      this.orderItem.quantityOrdered = 0;
      this.orderItem.totalOrderPrice = 0;
      return;
    }

    const packageQty = Number(this.orderItem.packageQuantity) || 0;
    const looseQty = Number(this.orderItem.looseQuantity) || 0;
    const unitsPerPackage = Number(this.orderItem.unitPerPackage) || 1;

    let totalQuantity = packageQty * unitsPerPackage + looseQty;

    this.orderItem.quantityOrdered = +totalQuantity.toFixed(2);
    this.checkQuantity();
    this.calculateOrder();
  }

  calculateSummary() {
    this.totalPayableAmount = +(
      this.totalPrice -
      this.previousBalance -
      this.saleInvoiceIssueForm.get('rebate')?.value +
      this.saleInvoiceIssueForm.get('extraCharge')?.value
    ).toFixed(2);
    this.saleInvoiceIssueForm
      .get('totalPaidAmount')
      ?.setValue(this.totalPayableAmount);
    this.receiptModel.subTotal = this.totalPrice;
    this.receiptModel.total = this.totalPayableAmount;
    this.receiptModel.discount = this.saleInvoiceIssueForm.get('rebate')?.value;
    // if (this.isWalkingCustomer) {
    //   this.saleInvoiceIssueForm
    //     .get('totalPaidAmount')
    //     ?.setValue(this.totalPayableAmount);
    // }
    this.saleInvoiceIssueForm
      .get('duePayment')
      ?.setValue(
        this.totalPayableAmount -
          (this.saleInvoiceIssueForm.get('totalPaidAmount')?.value || 0)
      );
  }

  // testing

  // addOrder() {
  //   if (!this.canAddOrder()) return;

  //   if (
  //     !this.orderItem.productId ||
  //     !this.orderItem.quantityOrdered ||
  //     !this.orderItem.pricePerUnit
  //   ) {
  //     return;
  //   }

  //   this.orderList.push(this.orderItem);
  //   this.orderItem = new OrderItem();

  //   let totalPrice = 0;
  //   let totalCost = 0;

  //   this.orderList.map((elem) => {
  //     totalPrice += elem.totalOrderPrice;
  //     totalCost += elem.totalOrderCost;
  //     this.receiptModel.orders.push({
  //       item: elem.productName,
  //       rate: elem.pricePerUnit,
  //       qty: elem.quantityOrdered,
  //       total: elem.totalOrderPrice,
  //     });
  //   });

  //   this.saleInvoiceIssueForm.get('orders')?.setValue(this.orderList);
  //   this.saleInvoiceIssueForm.get('totalPrice')?.setValue(totalPrice);
  //   this.saleInvoiceIssueForm.get('totalCost')?.setValue(totalCost);
  //   this.saleInvoiceIssueForm.get('productName')?.setValue('');
  //   this.saleInvoiceIssueForm.get('productCode')?.setValue('');
  //   this.totalPrice = totalPrice;
  //   this.totalPayableAmount = this.totalPrice - this.previousBalance;
  //   this.saleInvoiceIssueForm
  //     .get('totalPaidAmount')
  //     ?.setValue(this.totalPayableAmount);
  //   this.calculateSummary();

  //   if (this.totalPayableAmount < 0) {
  //     this.balanceType = 'Return';
  //   } else {
  //     this.balanceType = 'Payable';
  //   }
  // }

  addOrder() {
    if (!this.canAddOrder()) return;

    if (!this.orderItem.productId || !this.orderItem.quantityOrdered || !this.orderItem.pricePerUnit) {
      return;
    }

    // Check for existing product in orderList
    const existingItemIndex = this.orderList.findIndex(
      item => item.productId === this.orderItem.productId
    );

    // Calculate total requested quantity
    const requestedQty = existingItemIndex > -1
      ? this.orderList[existingItemIndex].quantityOrdered + this.orderItem.quantityOrdered
      : this.orderItem.quantityOrdered;

    // Stock validation
    if (requestedQty > this.availableStock) {
      const available = this.availableStock - 
                       (existingItemIndex > -1 ? this.orderList[existingItemIndex].quantityOrdered : 0);
      this.notificationService.showErrorMessage(
        'Stock Exceeded',
        `Only ${available} units available for ${this.orderItem.productName}`,
        'OK',
        3000
      );
      return;
    }

    if (existingItemIndex > -1) {
      // Update existing item
      const existingItem = this.orderList[existingItemIndex];
      existingItem.quantityOrdered += this.orderItem.quantityOrdered;
      existingItem.totalOrderPrice = existingItem.quantityOrdered * existingItem.pricePerUnit;
      existingItem.totalOrderCost = existingItem.quantityOrdered * existingItem.buyingPricePerUnit;
      
      // Update receipt model
      const receiptItemIndex = this.receiptModel.orders.findIndex(
        item => item.item === existingItem.productName
      );
      if (receiptItemIndex > -1) {
        this.receiptModel.orders[receiptItemIndex].qty = existingItem.quantityOrdered;
        this.receiptModel.orders[receiptItemIndex].total = existingItem.totalOrderPrice;
      }
    } else {
      // Add new item
      this.orderList.push({...this.orderItem});
      this.receiptModel.orders.push({
        item: this.orderItem.productName,
        rate: this.orderItem.pricePerUnit,
        qty: this.orderItem.quantityOrdered,
        total: this.orderItem.totalOrderPrice
      });
    }

    // Reset for next item
    this.orderItem = new OrderItem();
    
    // Update totals (keep your existing calculations)
    let totalPrice = 0;
    let totalCost = 0;
    this.orderList.forEach((elem) => {
      totalPrice += elem.totalOrderPrice;
      totalCost += elem.totalOrderCost;
    });

    this.saleInvoiceIssueForm.get('orders')?.setValue(this.orderList);
    this.saleInvoiceIssueForm.get('totalPrice')?.setValue(totalPrice);
    this.saleInvoiceIssueForm.get('totalCost')?.setValue(totalCost);
    this.saleInvoiceIssueForm.get('productName')?.setValue('');
    this.saleInvoiceIssueForm.get('productCode')?.setValue('');
    this.totalPrice = totalPrice;
    this.totalPayableAmount = this.totalPrice - this.previousBalance;
    this.saleInvoiceIssueForm.get('totalPaidAmount')?.setValue(this.totalPayableAmount);
    this.calculateSummary();

    if (this.totalPayableAmount < 0) {
      this.balanceType = 'Return';
    } else {
      this.balanceType = 'Payable';
    }
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
    if (this.isSubmitting) return; // Prevent multiple clicks
    this.isSubmitting = true; // Disable the button
    this.showLoader = true;
    let orderIssueModel = this.saleInvoiceIssueForm.value;
    orderIssueModel.accountId = this.account.id;
    orderIssueModel.comment = this.comment;
    orderIssueModel.totalPayableAmount = this.totalPayableAmount;
    orderIssueModel.previousBalance = this.account.balance;
    orderIssueModel.issuedBy = this.userName;
    orderIssueModel.isWalkingCustomer = this.isWalkingCustomer;
    const params: Map<string, any> = new Map();
    if (this.isApprovalNeeded) {
      let approvalModel = {
        payload: JSON.stringify(orderIssueModel),
        createdBy: this.userName,
        taskType: Tasks.CREATE_INVOICE,
        status: 'OPEN',
        state: 'OPEN',
      };
      const params: Map<string, any> = new Map();
      params.set('approval', approvalModel);
      this.inventoryService.sendToApproval(params).subscribe({
        next: (res) => {
          this.notificationService.showMessage(
            'SUCCESS!',
            'Approval Sent',
            'OK',
            2000
          );
          // this.downloadInvoice();
          // this.route.navigate(['/sale/sale-invoice-list']);
          window.location.reload();
        },
        error: (err) => {
          this.notificationService.showMessage(
            'Failed!',
            'Approval Sending Failed. ' + err.message,
            'OK',
            2000
          );
          this.isSubmitting = false; // Re-enable if API fails
          this.showLoader = false;
        },
        complete: () => {
          this.showLoader = false;
        },
      });
    } else {
      this.showLoader = true;
      params.set('invoice', orderIssueModel);
      this.inventoryService.issueSalesOrder(params).subscribe({
        next: (res) => {
          this.notificationService.showMessage(
            'SUCCESS!',
            'Invoice Created',
            'OK',
            2000
          );
          // openModal();
          this.receiptModel.invoiceNo = res.body.invoiceNo;
          setTimeout(() => {
            // Timeout for ensuring content load
            this.printReport();
            window.location.reload();
          }, 2000);
          // this.printReport();
          this.showLoader = false;
          // this.route.navigate(['/sale/sale-invoice-list']);
          // window.location.reload();
        },
        error: (err) => {
          this.notificationService.showMessage(
            'ERROR!',
            'Invoice Not Created',
            'OK',
            2000
          );
          this.showLoader = false;
        },
        complete: () => {
          this.showLoader = false;
        },
      });
    }
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

  downloadInvoice() {
    let orders: any[] = [];
    let index = 1;
    this.customer.person = this.person;
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
      issuedBy: localStorage.getItem('personName'),
      customer: this.customer,
      tnxDate: this.applyFilter(new Date()),
      customerName: this.person.personName,
      customerAddress: this.person.personAddress,
      totalPrice: this.totalPrice,
      previousBalance: this.previousBalance,
      totalPayableAmount: this.totalPayableAmount,
      totalPayableAmountInWords: this.toWords.convert(
        Math.abs(this.totalPayableAmount)
      ),
      totalPaid: this.saleInvoiceIssueForm.get('totalPaidAmount')?.value,
      discount: this.saleInvoiceIssueForm.get('rebate')?.value,
      orders: orders,
      dueAmount:
        this.totalPayableAmount -
        this.saleInvoiceIssueForm.get('totalPaidAmount')?.value,
      extraCharge: this.saleInvoiceIssueForm.get('extraCharge')?.value,
      chargeReason:
        this.saleInvoiceIssueForm.get('chargeReason')?.value != ''
          ? this.saleInvoiceIssueForm.get('chargeReason')?.value
          : 'Extra Charge',
    };
    this.pdfMakeService.downloadSaleInvoice(invoiceModel);
  }

  showPositive(number: any) {
    return Math.abs(Number(number));
  }
  removeOrder(index: any) {
    let removedOrder = this.orderList[index];
    this.orderList.splice(index, 1);
    let totalPrice = 0;
    this.orderList.map((elem) => {
      totalPrice += elem.totalOrderPrice;
    });
    this.saleInvoiceIssueForm.get('orders')?.setValue(this.orderList);
    this.saleInvoiceIssueForm.get('totalPrice')?.setValue(totalPrice);
    this.totalPrice = totalPrice;
    this.calculateSummary();
    if (this.isWalkingCustomer) {
      this.saleInvoiceIssueForm
        .get('totalPaidAmount')
        ?.setValue(this.totalPayableAmount);
    }
    if (this.totalPayableAmount < 0) {
      this.balanceType = 'Return';
    } else {
      this.balanceType = 'Payable';
    }
  }
  checkQuantity() {
    if (this.orderItem.quantityOrdered > this.availableStock) {
      this.stockMsg = 'Warning!! Stock Exceeded.';
      this.notificationService.showErrorMessage(
        'Stock Unavailable',
        "You don't have enough Stock of this Product",
        'OK',
        2000
      );
    } else {
      this.stockMsg = '';
    }
  }
  // printReport() {
  //   const cssString = `
  //   .receipt-body {
  //       font-family: 'Courier New', Courier, monospace;
  //       font-size: 12px;
  //       font-weight: bold;
  //       color: #000;
  //       text-align: center;
  //       padding: 10px;
  //   }

  //   .receipt-container {
  //       width: 330px; /* Adjust based on the thermal printer paper width */
  //       margin: 0 auto;
  //       text-align: left;
  //       font-size: 1.5em;
  //       font-weight: 400;
  //       color: #000;
  //       padding: 5px;
  //       box-shadow: 0 0 10px rgba(0,0,0,0.1);
  //   }

  //   h2 {
  //       text-align: center;
  //       margin: 0;
  //   }
  //   .tbl-h{
  //       border-bottom: 1px dashed #000;
  //   }

  //   .tbl-th{
  //       text-align: left;
  //   }
  //   .receipt-info, .receipt-items, .receipt-summary, .receipt-footer, .customer-info {
  //       border-top: 1px dashed #000;
  //       padding-top: 10px;
  //   }

  //   .receipt-info p, .receipt-footer p, .customer-info p {
  //       margin: 5px 0;
  //   }

  //   .item-header, .item, .receipt-summary {
  //       display: flex;
  //       justify-content: space-between;
  //   }

  //   .item-header {
  //       font-weight: bold;
  //   }

  //   .item:not(:last-child) {
  //       margin-bottom: 5px;
  //   }
  //   table{
  //       width: 100%;
  //   }

  //   th, td{
  //       text-align: left;
  //   }
  //   tr{
  //       max-height: 10px;
  //       overflow: hidden;
  //   }`;

  //   const printContents = document.getElementById('printable');
  //   if (printContents) {
  //     const win = window.open('', '', 'height=500, width=500');
  //     win?.document.write(
  //       '<html><head><title>Print</title><style>' + cssString
  //     );
  //     // Add some styles here if necessary
  //     win?.document.write('</style></head><body>');
  //     win?.document.write(printContents.innerHTML); // Use the innerHTML of the "printable" element
  //     win?.document.write('</body></html>');
  //     win?.document.close();
  //     win?.focus();

  //     setTimeout(() => {
  //       // Timeout for ensuring content load
  //       win?.print();
  //       win?.close();
  //       window.location.reload();
  //     }, 1000);
  //   }
  // }
  printReport() {
    const printContents =
      this.PrintableReceiptComponent.nativeElement.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    // window.location.reload();
  }
  closeModal() {
    closeModal();
    window.location.reload();
  }
  // addQuantity(type:string) {
  //   if (!this.orderItem.productId) return;

  //   if(type=="add"){
  //     this.orderItem.looseQuantity = +(this.orderItem.looseQuantity) + 1;
  //   }else{
  //     this.orderItem.looseQuantity = +(this.orderItem.looseQuantity) - 1;
  //   }

  //   this.calculateQuantity();
  // }
  addQuantity(type: string) {
    if (!this.orderItem.productId) return;

    let looseQuantity = +this.orderItem.looseQuantity;
    if (type === 'add') {
      this.orderItem.looseQuantity = (looseQuantity || 0) + 1;
    } else {
      // Ensure quantity doesn't go below 0
      this.orderItem.looseQuantity = Math.max(0, (looseQuantity || 0) - 1);
    }

    this.calculateQuantity();
  }
  customerTypeChnaged(event: any) {
    this.isCustomerExist = event.checked;
    if (event.checked) {
      this.customerType = 'Walk-IN Customer';
      this.person.personName = 'Walk-IN Customer';
      // Clear all validators
      this.saleInvoiceIssueForm.get('customerId')?.clearValidators();
      // Reset the value
      this.saleInvoiceIssueForm.reset();
    } else {
      this.customerType = 'Member';
      this.saleInvoiceIssueForm
        .get('customerId')
        ?.setValidators([Validators.required]);
      // Reset the value
      this.saleInvoiceIssueForm.reset();
    }
    // Update the form control's validation and value state
    this.saleInvoiceIssueForm.updateValueAndValidity();
  }
  // canAddOrder(): boolean {
  //   return (
  //     !!this.orderItem.productId &&
  //     this.orderItem.looseQuantity > 0 &&
  //     this.orderItem.totalOrderPrice > 0
  //   );
  // }

  canAddOrder(): boolean {
    return (
      !!this.orderItem.productId &&
      this.orderItem.looseQuantity > 0 &&
      this.orderItem.totalOrderPrice > 0 &&
      !this.isStockInsufficient()
    );
  }

  // to check stock availability
  isStockInsufficient(): boolean {
    if (!this.orderItem.productId) return true;

    const requestedQuantity =
      (Number(this.orderItem.packageQuantity) || 0) *
        (Number(this.orderItem.unitPerPackage) || 1) +
      (Number(this.orderItem.looseQuantity) || 0);

    return requestedQuantity > this.availableStock;
  }
  // Handle key events for barcode scanning
@HostListener('document:keypress', ['$event'])
handleKeyboardEvent(event: KeyboardEvent) {
  if (this.productCodeInput.nativeElement !== document.activeElement) {
    return;
  }

  // Check if input is a barcode character (not modifier keys)
  if (event.key.length === 1) {
    this.barcodeInput += event.key;
    
    // Reset the timer on each keypress
    if (this.barcodeTimeout) {
      clearTimeout(this.barcodeTimeout);
    }
    
    // Set timeout to detect end of barcode input
    this.barcodeTimeout = setTimeout(() => {
      this.processBarcode(this.barcodeInput);
      this.barcodeInput = '';
    }, 100); // Adjust timeout based on your barcode scanner speed
  }
}

// Process the scanned barcode
processBarcode(barcode: string) {
  // Trim any whitespace or special characters
  barcode = barcode.trim();
  
  if (!barcode) return;

  // Find product by barcode
  const product = this.productList.find(p => p.productCode === barcode);
  
  if (product) {
    // Set the form values
    this.saleInvoiceIssueForm.get('productCode')?.setValue(product.productCode);
    this.saleInvoiceIssueForm.get('productName')?.setValue(product.productName);
    
    // Trigger product selection
    this.productSelected({ option: { value: product } });
    
    // Focus on quantity field for quick entry
    setTimeout(() => {
      const quantityInput = document.querySelector('input[formControlName="looseQuantity"]') as HTMLInputElement;
      if (quantityInput) {
        quantityInput.focus();
        quantityInput.select();
      }
    }, 50);
  } else {
    this.notificationService.showErrorMessage(
      'Product Not Found',
      `No product found with barcode: ${barcode}`,
      'OK',
      2000
    );
  }
}
}
