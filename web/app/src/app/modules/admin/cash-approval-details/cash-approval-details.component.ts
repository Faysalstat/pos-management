import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToWords } from 'to-words';
import { Tasks } from '../../model/models';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';
import { PdfMakeService } from '../../services/pdf-make.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-cash-approval-details',
  templateUrl: './cash-approval-details.component.html',
  styleUrls: ['./cash-approval-details.component.css']
})
export class CashApprovalDetailsComponent implements OnInit {
  taskId!:number;
  taskDetail!:any;
  taskType!:any;
  showLoader: boolean = false;
  comment:string ="";
  updatedBalance:number = 0;
  userProfile:any;
  toWords = new ToWords();
  constructor(
    private activatedRoute: ActivatedRoute,
    private inventoryService: InventoryService,
    // private clientService: ClientService,
    private notificationService : NotificationService,
    private transactionService :TransactionService,
    private router: Router,
    private pdfMakeService: PdfMakeService
  ) { 

  }

  ngOnInit(): void {
    this.userProfile = localStorage.getItem('username');
    this.fetchPayloadByTaskId();
  }

  fetchPayloadByTaskId() {
    this.activatedRoute.params.subscribe((parameter) => {
      let id = parameter['id'];
      this.taskId = id;
      this.inventoryService.fetchTaskById(this.taskId).subscribe({
        next: (res) => {
          this.taskDetail = res.body.payload;
          this.taskType = res.body.taskType;
          this.comment = this.taskDetail.comment;
          if(this.taskDetail.account){
            if(this.taskDetail.isReturn){
              this.updatedBalance = Number(this.taskDetail.account.balance) - Number(this.taskDetail.cashAmount)
            }else{
              this.updatedBalance = Number(this.taskDetail.account.balance) + Number(this.taskDetail.cashAmount)
            }
          }
        },
      });
    });
  }

  declineApproval(){
    this.showLoader = true;
    const params: Map<string, any> = new Map();
    let task = {
      taskId: this.taskId
    }
    params.set("task",task)
    this.inventoryService.declineApproval(params).subscribe({
      next:(res)=>{
        this.showLoader = false;
        this.notificationService.showMessage("SUCCESSFULL","Approval Deleted","OK",500);
        this.router.navigate(['/layout/admin/task-list']);
      },
      error:(err)=>{
        this.showLoader = false;
        this.notificationService.showErrorMessage("Warning","Deletion Failed","Ok",500);
      },
      complete:()=>{
        this.showLoader = false;
      }
    })
  }

  approveTransaction(){
    this.showLoader = true;
    const params: Map<string, any> = new Map();
    this.taskDetail.taskId = this.taskId;
    this.taskDetail.comment = this.comment;
    this.taskDetail.approveBy = localStorage.getItem("username");
    if(this.taskType == Tasks.PAYMENT_TRANSACTION){
      params.set("payment",this.taskDetail);
      this.inventoryService.doPaymentTransaction(params).subscribe({
        next:(res)=>{
          this.showLoader = false;
          this.notificationService.showMessage("SUCCESS!","Payment Successful","OK",400);
          this.downloadMemo(res.voucherNo);
          this.router.navigate(['/layout/admin/task-list']);
        },
        error:(err)=>{
          this.showLoader = false;
          this.notificationService.showMessage("ERROR!","Payment FAILED","OK",200);
        },
        complete:()=>{
          this.showLoader = false;
        }
      })
    }
    else if(this.taskType == Tasks.DEPOSIT_TRANSACTION 
      || this.taskType == Tasks.EXPENSE_TRANSACTION
      || this.taskType == Tasks.CASH_HANDOVER){
      params.set('expenseModel', this.taskDetail);
      this.transactionService.doExpense(params).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.notificationService.showMessage(
              'Success!',
              'Payment Complete',
              'OK',
              500
            );
            this.router.navigate(['/layout/admin/task-list']);
          } else {
            this.showLoader = false;
            this.notificationService.showErrorMessage(
              'ERROR!',
              res.message,
              'OK',
              500
            );
          }
        },
        error: (err) => {
          this.showLoader = false;
          this.notificationService.showErrorMessage(
            'ERROR!',
            'Operation Failed' + err.message,
            'OK',
            2000
          );
        },
        complete:()=>{
          this.showLoader = false;
        }
      });
    }
    else if(this.taskType == Tasks.SALARY_TRANSACTION){
      params.set("salaryModel",this.taskDetail);
      this.transactionService.paySalary(params).subscribe({
        next:(res)=>{
          this.showLoader = false;
          if (res.isSuccess) {
            this.notificationService.showMessage(
              'Success!',
              'Payment Complete',
              'OK',
              500
            );
            this.router.navigate(['/layout/admin/task-list']);
          } else {
            this.notificationService.showErrorMessage(
              'ERROR!',
              res.message,
              'OK',
              500
            );
          }
        },
        error:(err)=>{
          this.showLoader = false;
          this.notificationService.showErrorMessage(
            'ERROR!',
            'Operation Failed' + err.message,
            'OK',
            2000
          );
        },
        complete:()=>{
          this.showLoader = false;
        }
      })
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
  downloadMemo(voucherNo:string) {
    let data: any[] = [];
    let index = 1;
    let tnxAmount = this.taskDetail.cashAmount;
    let tnxDate = this.applyFilter(new Date());
    let debitAmount = 0;
    let creditAmount = 0;
    if (this.taskDetail.clientType == 'CUSTOMER'){
      if(this.taskDetail.transactionType !="RETURN" ){
        debitAmount = tnxAmount;
      }else{
        creditAmount = tnxAmount;
      }
    } else if(this.taskDetail.clientType == 'SUPPLIER'){
      if(this.taskDetail.transactionType !="RETURN"){
        creditAmount = tnxAmount;
      }else{
        debitAmount = tnxAmount;
      }
    }
    data.push(['1',tnxDate,this.taskDetail.paymentMethod,debitAmount,creditAmount])
    let model = {
      voucher: voucherNo || "",
      issuedBy: localStorage.getItem('personName'),
      customer: this.taskDetail.customer,
      supplier:this.taskDetail.supplier,
      tnxDate: this.applyFilter(new Date()),
      clientName: this.taskDetail.person.personName,
      tnxAmount: this.taskDetail.cashAmount,
      tnxType: this.taskDetail.transactionType,
      tnxAmountInWords: this.toWords.convert(
        this.taskDetail.cashAmount || 0
      ),
      data:data
    };
    if(this.taskDetail.clientType == "CUSTOMER"){
      this.pdfMakeService.downloadCustomerPaymentInvoice(model);
    }else if(this.taskDetail.clientType == "SUPPLIER"){
      this.pdfMakeService.downloadSupplyerPaymentInvoice(model);
    }
  }

}
