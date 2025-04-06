import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Route, Router } from '@angular/router';
import { COFIGS, Tasks } from '../../model/models';
import { ClientService } from '../../services/client.service';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-add-loan-details',
  templateUrl: './add-loan-details.component.html',
  styleUrls: ['./add-loan-details.component.css']
})
export class AddLoanDetailsComponent implements OnInit {
  @Output() loanEvent = new EventEmitter<string>();
  depositAmount!: number;
  clientType: string='BANK_LOAN';
  selectedClient:any = null;
  clients!:any;
  receivedDate: Date= new Date();
  returnDate!: Date ;
  paymentMethod: string='CASH';
  interestRate: number = 0;
  comment!: String;
  types: any[];
  paymentMethods: any[];
  userName: any;
  isApprovalNeeded: boolean = false;
  isSubmitted: boolean = false;
  showLoader = false;
  constructor(
    private notificationService: NotificationService,
    private transactionService: TransactionService,
    private inventoryService: InventoryService,
    private clientService: ClientService,
    private route:Router
  ) {
    this.types = [
      { label: 'Select Deposit Type', value: '' },
      { label: 'Director Investment', value: 'DIRECTOR_INVESTMENT' },
      { label: 'Loan', value: 'LOAN' },
      { label: 'Bank', value: 'BANK' },
      { label: 'Other', value: 'OTHER' },
    ];
    this.paymentMethods = [
      { label: 'Select Payment Method', value: '' },
      { label: 'CASH', value: 'CASH' },
      { label: 'BANK', value: 'BANK' },
      { label: 'BKASH', value: 'BKASH' },
      
    ];
  }
  ngOnInit(): void {
    this.userName = localStorage.getItem('username');
    this.fetchDepositTypes();
    this.getConfig(COFIGS.TRANSACTION_APPROVAL_NEEDED);
    this.fetchAllLoanAcc();
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
  fetchDepositTypes() {}
  submit() {
    
    if (!this.clientType || !this.selectedClient || !this.depositAmount) {
      this.notificationService.showErrorMessage(
        'INVALID',
        'Input All Data',
        'OK',
        400
      );
      return;
    }
    this.isSubmitted = true;
    let loanModel = {
      transactionType: "LOAN",
      clientType: this.clientType,
      loanClientId: this.selectedClient.id,
      cashAmount: this.depositAmount,
      comment: this.comment,
      issuedBy: localStorage.getItem("username"),
      interestRate: this.interestRate || 0,
      receivedDate: this.receivedDate,
      returnDate: this.returnDate,
      paymentMethod : this.paymentMethod
    };
    if (this.isApprovalNeeded) {
      let approvalModel = {
        payload: JSON.stringify(loanModel),
        createdBy: this.userName,
        taskType: Tasks.CREATE_LOAN,
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
          this.route.navigate(['/layout/cash/transaction-list']);
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
      const params: Map<string, any> = new Map();
      params.set('expenseModel', loanModel);
      this.transactionService.doExpense(params).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.isSubmitted = false;
            this.depositAmount = 0;
            this.comment = '';
            this.paymentMethod = 'CASH'
            this.interestRate = 0;
            this.loanEvent.emit('Balance Changed');
            this.notificationService.showMessage(
              'Success!',
              'Payment Complete',
              'OK',
              500
            );
          } else {
            this.notificationService.showErrorMessage(
              'ERROR!',
              res.message,
              'OK',
              500
            );
          }
        },
        error: (err) => {
          this.isSubmitted = false;
          console.log(err.message);
          this.notificationService.showErrorMessage(
            'ERROR!',
            'Operation Failed' + err.message,
            'OK',
            2000
          );
        },
      });
    }
  }
  fetchAllLoanAcc(){
    const params: Map<string, any> = new Map();
    params.set("clientType","LOAN_ACC");
    this.clientService.getAllClient(params).subscribe({
      next:(res)=>{
        console.log(res.body);
        this.clients = [{label:"Select Client",value:null}];
        let clientList = res.body;
        clientList.map((elem:any)=>{
          let clientModel = {label:elem.clientName,value:elem};
          this.clients.push(clientModel);
        })
      },
      error:(err)=>{
        console.log(err.message)
      }
    })
  }
}
