import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-account-history-report',
  templateUrl: './account-history-report.component.html',
  styleUrls: ['./account-history-report.component.css']
})
export class AccountHistoryReportComponent implements OnInit {
  queryBody:any;
  selectedAccountType = "";
  accountTypes: any[];
  accountHistory:any[] = [];
  accountHistoryExportable: any[] = [];
  isSupplier: boolean = false;
  isCustomer: boolean = false;
  isGl: boolean = true;
  contactNo = "";
  code = "";
  glAccounts:any [] = [];
  selectedGl!:any;
  constructor(
    private clientService:ClientService,
    private notificationService:NotificationService
  ) { 
    this.queryBody = {
      tnxType:"",
      accountId: this.selectedGl || 0,
      fromDate: new Date('1/1/2023'),
      toDate: new Date(),
    };
    this.accountTypes = [
      {label:"Select Account Type", value:""},
      {label:"Supplier", value:"SUPPLIER"},
      {label:"Customer", value:"CUSTOMER"},
      {label:"GL", value:"GL"},
    ]
  }

  ngOnInit(): void {
    this.fetchGlAccounts();
    this.fetchAccountHistory();
  }
  onAccountTypeSelectionChange(event:any){
    if (this.selectedAccountType == 'CUSTOMER') {
      this.isCustomer = true;
      this.isSupplier = false;
      this.isGl = false;
    } else if (this.selectedAccountType == 'SUPPLIER') {
      this.isCustomer = false;
      this.isSupplier = true;
      this.isGl = false;
    }
    else if(this.selectedAccountType == 'GL') {
      this.isCustomer = false;
      this.isSupplier = false;
      this.isGl = true;
    }
  }
  fetchGlAccounts(){
    const params: Map<string, any> = new Map();
    params.set("category","GL");
    this.clientService.getAccountListByCategory(params).subscribe({
      next:(res)=>{
        let accounts = res.body;
        this.glAccounts = [];
        accounts.map((elem:any)=>{
          let model = {label:elem.accountType,value:elem};
          this.glAccounts.push(model);
        })
        this.glAccounts
      },
      error:(err)=>{
        console.log(err.message);
      }
    })
  }
  searchCustomer() {
    const params: Map<string, any> = new Map();
    if (this.selectedAccountType == 'CUSTOMER') {
      this.clientService.getClientByContactNo(this.contactNo).subscribe({
        next: (res) => {
          console.log(res.body);
          if (res.body) {
            if (res.body.customer) {
              this.queryBody.accountId = res.body.customer.account.id;
              this.selectedGl = res.body.customer.account;
              this.fetchAccountHistory();
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
        },
      });
    } else if (this.selectedAccountType == 'SUPPLIER') {
      params.set('id', '');
      params.set('code', this.code);
      this.clientService.getSupplyerByCode(params).subscribe({
        next: (res) => {
          if (res.body) {
            this.queryBody.accountId = res.body.account.id;
            this.selectedGl = res.body.account;
            this.fetchAccountHistory();
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
          this.notificationService.showMessage(
            'ERROR',
            'Error Happend ' + err.message,
            'OK',
            200
          );
        },
      });
    }
  }
  fetchAccountHistory(){
    const params: Map<string, any> = new Map();
    params.set("fromDate",this.queryBody.fromDate);
    params.set("toDate",this.queryBody.toDate);
    params.set("tnxType",this.queryBody.tnxType);
    params.set("accountId",this.queryBody.accountId);
    this.clientService.getAccountHistoryListByAccountId(params).subscribe({
      next:(res)=>{
        if(res.isSuccess){
          this.accountHistory = res.body;
          this.accountHistoryExportable = [];
          let sn = 0;
          this.accountHistory.map((elem) => {
            let item = {
              SN: sn + 1,
              TNX_TYPE: elem.tnxType,
              TNX_DATE: elem.tnxDate,
              TNX_AMOUNT: elem.tnxAmount,
              PAYMENT_METHOD: elem.paymentMethod,
              COMMENT: elem.remark,
            };
            this.accountHistoryExportable.push(item);
          });
        }else{
          this.notificationService.showErrorMessage("ERROR",res.message,"OK",200);
        }
      }
    })
  }
  export(){}
  onselectGL(){
    this.queryBody.accountId = this.selectedGl.id;
    this.fetchAccountHistory();
  }
}
