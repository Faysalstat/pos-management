import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { COFIGS, Tasks } from '../../model/models';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css']
})
export class ExpenseComponent implements OnInit {
  @Output() expenseEvent = new EventEmitter<string>();
  expenseType!:string;
  expenseTypes!:any[];
  amount!:number;
  receivedBy!:string;
  remarks!:string;
  selectedExpense!:any;
  expenseReason:string='';
  isSubmitted: boolean = false;
  showLoader: boolean = false;
  paymentMethods:any[] = [];
  transactionReasons:any[] = []
  paymentMethod:string = "CASH";
  isApprovalNeeded:boolean = false;
  userName:any;
  constructor(
    private notificationService: NotificationService,
    private transactionService: TransactionService,
    private inventoryService: InventoryService,
    private route:Router
  ) { 
    this.paymentMethods = [
      { label: 'Select Payment Method', value: '' },
      { label: 'BANK', value: 'BANK' },
      { label: 'BKASH', value: 'BKASH' },
      { label: 'CASH', value: 'CASH' },
    ];
  }

  ngOnInit(): void {
    this.userName = localStorage.getItem('username');
    this.fetchTransactionReasons();
    this.getConfig(COFIGS.EXPENSE_APPROVAL_NEEDED);
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

  submit(){
    this.isSubmitted = true;
    if(!this.expenseReason || this.expenseReason=='' || !this.amount ){
      this.notificationService.showErrorMessage("INVALID","Input All Data","OK",200);
      return;
    }
    let expenseModel = {
        transactionReason: this.expenseReason,
        paymentMethod: this.paymentMethod,
        cashAmount: this.amount,
        receivedBy: this.receivedBy,
        comment: this.remarks,
        transactionType:"EXPENSE",
        issuedBy: localStorage.getItem("username"),
    };
    if(this.isApprovalNeeded){
      let approvalModel = {
        payload: JSON.stringify(expenseModel),
        createdBy: this.userName,
        taskType: Tasks.EXPENSE_TRANSACTION,
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

    }else{
      const params:Map<string,any> = new Map();
      params.set("expenseModel",expenseModel);
      this.transactionService.doExpense(params).subscribe({
        next:(data)=>{
          this.isSubmitted = false;
          if(data.isSuccess){
            this.selectedExpense = null;
            this.amount = 0;
            this.receivedBy = "";
            this.remarks ="";
            this.expenseReason = "";
            this.expenseEvent.emit("Balance Changed");
            this.notificationService.showMessage("Success!","Payment Complete","OK",500);
          }else{
            this.notificationService.showErrorMessage("ERROR!",data.message,"OK",500);
          }
        },
        error:(err)=>{
          this.isSubmitted = false;
          console.log(err.message);
          this.notificationService.showErrorMessage("ERROR!","Operation Failed" + err.message,"OK",2000);
        }
      })
    }
    }
    
}
