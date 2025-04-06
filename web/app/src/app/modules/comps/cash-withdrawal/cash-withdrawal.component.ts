import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { COFIGS, Tasks } from '../../model/models';
import { ClientService } from '../../services/client.service';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-cash-withdrawal',
  templateUrl: './cash-withdrawal.component.html',
  styleUrls: ['./cash-withdrawal.component.css']
})
export class CashWithdrawalComponent implements OnInit {
  @Output() withdrawalEvent = new EventEmitter<string>();
  amount!:number;
  receivedBy!:string;
  remarks:string = '';
  showLoader: boolean = false;
  isApprovalNeeded:boolean = false;
  userName:any;
  tnxDate:any;
  constructor(
    private notificationService: NotificationService,
    private transactionService: TransactionService,
    private clientService: ClientService,
    private inventoryService: InventoryService,
    private route:Router
  ) { 
    this.tnxDate = new Date()
  }

  ngOnInit(): void {
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
  submit(){
    this.showLoader = true;
    let drawingModel = {
        transactionReason: "CASH_WITHDRAWAL",
        paymentMethod: "CASH",
        cashAmount: this.amount,
        payingTo: this.receivedBy,
        comment: this.remarks,
        transactionType:"DRAWING",
        issuedBy: localStorage.getItem("username")
    };
    if(this.isApprovalNeeded){
      let approvalModel = {
        payload: JSON.stringify(drawingModel),
        createdBy: this.userName,
        taskType: Tasks.CASH_HANDOVER,
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
      params.set("expenseModel",drawingModel);
      this.transactionService.doExpense(params).subscribe({
        next:(data)=>{
          this.showLoader = false;
          if(data.isSuccess){
            this.amount = 0;
            this.receivedBy = "";
            this.remarks ="";
            this.withdrawalEvent.emit("Balance Changed");
            this.notificationService.showMessage("Success!","Transaction Complete","OK",500);
          }else{
            this.notificationService.showErrorMessage("ERROR!",data.message,"OK",500);
          }
        },
        error:(err)=>{
          this.showLoader = false;
          console.log(err.message);
          this.notificationService.showErrorMessage("ERROR!","Operation Failed" + err.message,"OK",2000);
        }
      })
    }
    }

}
