import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToWords } from 'to-words';
import { Account, COFIGS, Customer, Person, Supplyer, Tasks } from '../../model/models';
import { ClientService } from '../../services/client.service';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';
import { PdfMakeService } from '../../services/pdf-make.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-cash-transaction',
  templateUrl: './cash-transaction.component.html',
  styleUrls: ['./cash-transaction.component.css'],
})
export class CashTransactionComponent implements OnInit {
  types: any[] = [];
  cashTransactionForm!: FormGroup;
  isSupplier: boolean = true;
  isCustomer: boolean = false;
  selectedType: string = 'SUPPLIER';
  contactNo: string = '';
  code: string = '';
  person: Person = new Person();
  account: Account = new Account();
  customer: Customer = new Customer();
  supplier: Supplyer = new Supplyer();
  isClientFound: boolean = false;
  comment: string = '';
  paymentMethods: any[];
  transactionReasons!: any[];
  isTnxDone: boolean = false;
  isApprovalNeeded: boolean = true;
  userName!: any;
  isReturn: boolean = false;
  isOther: boolean = false;
  showLoader: boolean = false;
  toWords = new ToWords();
  transactionDate = new Date();
  isSubmitting: boolean = false; 
  constructor(
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private clientService: ClientService,
    private inventoryService: InventoryService,
    private transactionService: TransactionService,
    private route: Router,
    private pdfMakeService: PdfMakeService
  ) {
    this.types = [
      { value: 'PAYMENT', label: 'Payment' },
      { value: 'RECEIVE', label: 'Receive' },
    ];
    this.paymentMethods = [
      // {label:"Select Payment Method", value:null},
      { label: 'BANK', value: 'BANK' },
      { label: 'BKASH', value: 'BKASH' },
      { label: 'CASH', value: 'CASH' },
    ];
  }

  ngOnInit(): void {
    this.prepareForm();
    this.fetchTransactionReasons();
    this.userName = localStorage.getItem('username');
    this.getConfig(COFIGS.TRANSACTION_APPROVAL_NEEDED);
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
  prepareForm() {
    this.cashTransactionForm = this.formBuilder.group({
      transactionType: ['PAYMENT',[Validators.required]],
      transactionReason: [''],
      clientType: ['SUPPLIER'],
      accountId: [''],
      cashAmount: ['',[Validators.required]],
      paymentMethod: ['CASH'],
      isReturn: [false],
    });
  }
  onClientTypeChange() {
    this.isOther = false;
    if (this.selectedType == 'CUSTOMER') {
      this.isCustomer = true;
      this.isSupplier = false;
      this.cashTransactionForm.get('transactionType')?.setValue('RECEIVE');
      
    this.cashTransactionForm.get('clientType')?.setValue(this.selectedType);
    } else if (this.selectedType == 'SUPPLIER') {
      this.isCustomer = false;
      this.isSupplier = true;
      this.cashTransactionForm.get('transactionType')?.setValue('PAYMENT');
      
    this.cashTransactionForm.get('clientType')?.setValue(this.selectedType);
    }
    else if(this.selectedType == 'OTHER') {
      this.isOther = true;
    }
  }
  searchCustomer() {
    this.showLoader = true;
    const params: Map<string, any> = new Map();
    if (this.selectedType == 'CUSTOMER') {
      this.clientService.getClientByContactNo(this.contactNo.trim()).subscribe({
        next: (res) => {
          if (res.body) {
            this.person = res.body;
            if (res.body.customer) {
              this.customer = res.body.customer;
              this.account = res.body.customer.account;
              this.cashTransactionForm
                .get('accountId')
                ?.setValue(this.account.id);
              this.isClientFound = true;
            } else {
              this.notificationService.showMessage(
                'NOT FOUND',
                'This Person Not a Customer',
                'OK',
                200
              );
            }
          } else {
            this.notificationService.showMessage(
              'NOT FOUND',
              'This Contact Not in Our database',
              'OK',
              200
            );
          }
        },
        error: (err) => {
          this.notificationService.showMessage(
            'ERROR',
            'Error Happend ' + err.message,
            'OK',
            200
          );
          this.isClientFound = false;
        },
        complete:()=>{
          this.showLoader = false;
        }
      });
    } else if (this.selectedType == 'SUPPLIER') {
      params.set('id', '');
      params.set('code', this.code.trim());
      this.clientService.getSupplyerByCode(params).subscribe({
        next: (res) => {
          if (res.body) {
            this.supplier = res.body;
            this.person = res.body.person;
            this.account = res.body.account;
            this.cashTransactionForm
              .get('accountId')
              ?.setValue(this.account.id);
            this.isClientFound = true;
          } else {
            this.notificationService.showMessage(
              'NOT FOUND',
              'This Code Not in Our database',
              'OK',
              200
            );
          }
        },
        error: (err) => {
          this.isClientFound = false;
          this.notificationService.showMessage(
            'ERROR',
            'Error Happend ' + err.message,
            'OK',
            200
          );
        },
        complete:()=>{
          this.showLoader = false;
        }
      });
    }
  }

  submitTransaction() {
    if (this.cashTransactionForm.invalid || this.isSubmitting) {
      return; // Prevent submission if form is invalid or already submitting
    }
  
    this.isSubmitting = true; // Disable the button
    this.showLoader = true;
    let transactionModel = this.cashTransactionForm.value;
    transactionModel.issuedBy =this.userName;
    transactionModel.comment = this.comment;
    transactionModel.person = this.person;
    transactionModel.account = this.account;
    transactionModel.customer = this.customer;
    transactionModel.supplier = this.supplier; 
    transactionModel.tnxDate = this.transactionDate;
    if (this.isApprovalNeeded) {
      let approvalModel = {
        payload: JSON.stringify(transactionModel),
        createdBy: this.userName,
        taskType: Tasks.PAYMENT_TRANSACTION,
        status: 'OPEN',
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
          // this.downloadMemo(res.bod);
          this.route.navigate(['/layout/cash/transaction-list']);
        },
        error: (err) => {
          this.notificationService.showMessage(
            'Failed!',
            'Approval Sending Failed. ' + err.message,
            'OK',
            500
          );
          this.isSubmitting = false; // Re-enable on error
        },
        complete:()=>{
          this.showLoader = false;
        }
      });
    } else {
      this.showLoader = true;
      const params: Map<string, any> = new Map();
      params.set('payment', transactionModel);
      this.inventoryService.doPaymentTransaction(params).subscribe({
        next: (res) => {
          this.downloadMemo(res.voucherNo || '');
          this.notificationService.showMessage(
            'SUCCESS!',
            'Payment Successful',
            'OK',
            400
          );
          this.route.navigate(['/layout/cash/transaction-list']);
          
        },
        error: (err) => {
          this.notificationService.showMessage(
            'ERROR!',
            'Payment FAILED',
            'OK',
            200
          );
          this.showLoader = false;
          this.isTnxDone = false;
          this.isSubmitting = false; // Re-enable on error
        },
        complete:()=>{
          this.showLoader = false;
        }
      });
    }
  }

  fetchTransactionReasons() {
    this.transactionReasons = [
      { label: 'Select Transaction Reasons', value: '' },
    ];
    this.transactionService.fetchAllTransactionReason().subscribe({
      next: (res) => {
        if (res.body) {
          let reasons = res.body;
          reasons.map((elem: any) => {
            let option = { label: elem.key, value: elem.value };
            this.transactionReasons.push(option);
          });
        }
      },
    });
  }

  onChangeIsReturn(ev: any) {
    this.isReturn = ev.checked ? true : false;
    if(this.isReturn){
      this.cashTransactionForm.get('transactionType')?.setValue('RETURN');
    }else if(this.isCustomer){
      this.cashTransactionForm.get('transactionType')?.setValue('RECEIVE');
    }else{
      this.cashTransactionForm.get('transactionType')?.setValue('PAYMENT');
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
  downloadMemo(voucher:any) {
    let data: any[] = [];
    let index = 1;
    let tnxAmount = this.cashTransactionForm.get('cashAmount')?.value;
    let tnxDate = this.applyFilter(new Date());
    let debitAmount = 0;
    let creditAmount = 0;
    if (this.selectedType == 'CUSTOMER'){
      if(!this.isReturn){
        debitAmount = tnxAmount;
      }else{
        creditAmount = tnxAmount;
      }
    } else if(this.selectedType == 'SUPPLIER'){
      if(!this.isReturn){
        creditAmount = tnxAmount;
      }else{
        debitAmount = tnxAmount;
      }
    }
    data.push(['1',tnxDate,this.cashTransactionForm.get('paymentMethod')?.value,debitAmount,creditAmount])
    let model = {
      voucher: voucher,
      issuedBy: localStorage.getItem('personName'),
      customer: this.customer,
      supplier:this.supplier,
      person: this.person,
      tnxDate: this.applyFilter(new Date()),
      clientName: this.isCustomer?this.person.personName:this.supplier.person.personName,
      tnxAmount: this.cashTransactionForm.get('cashAmount')?.value,
      tnxType: this.cashTransactionForm.get('transactionType')?.value,
      tnxAmountInWords: this.toWords.convert(
        this.cashTransactionForm.get('cashAmount')?.value || 0
      ),
      data:data
    };
    if(this.isCustomer){
      this.pdfMakeService.downloadCustomerPaymentInvoice(model);
    }else if(this.isSupplier){
      this.pdfMakeService.downloadSupplyerPaymentInvoice(model);
    }
  }
}
