import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification-service.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-add-tnx-reason',
  templateUrl: './add-tnx-reason.component.html',
  styleUrls: ['./add-tnx-reason.component.css']
})
export class AddTnxReasonComponent implements OnInit {
  tnxReason!:string;
  reasons!:any[];
  constructor(
    private tnxService: TransactionService,
    private notificationService : NotificationService
  ) { }

  ngOnInit(): void {
    this.fetchTransactionReasons();
  }

  addTnxReason(){
    const params: Map<string, any> = new Map();
    let model = {
      key: this.tnxReason,
      value: this.tnxReason.toUpperCase()
    }
    params.set("model",model);
    this.tnxService.addTransactionReason(params).subscribe({
      next:(res)=>{
        if(res.body){
          this.tnxReason = '';
          this.notificationService.showMessage("SUCCESS",res.message,"OK",500);
          this.fetchTransactionReasons();
        }
      }
    })
  }
  fetchTransactionReasons(){
    this.tnxService.fetchAllTransactionReason().subscribe({
      next:(res)=>{
        if(res.body){
          this.reasons = res.body;
        }
      }
    })
  }
  deleteItem(id:any){
    this.tnxService.deleteTransactionReason(id).subscribe({
      next:(res)=>{
        if(res.isSuccess){
          console.log("Successfully Deleted");
          this.notificationService.showErrorMessage("SUCCESS","Deleted Item","Ok",500);
          this.fetchTransactionReasons();
        }else{
          
          this.notificationService.showErrorMessage("ERROR","Deletion Failed","Ok",500);
        }
      }
    })
    
  }
}
