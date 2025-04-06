import { Component, Input, OnInit } from '@angular/core';
import { ClientService } from '../../services/client.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-account-history',
  templateUrl: './account-history.component.html',
  styleUrls: ['./account-history.component.css']
})
export class AccountHistoryComponent implements OnInit {
  @Input() accountId!:any;
  @Input() tnxSide!:any;
  queryBody!:any;
  accountHistory: any[] = [];
  accountHistoryExportable: any[] = [];
  openingBalance:number = 0;
  closingBalance:number = 0;
  constructor(
    private clientService: ClientService,
    private notificationService: NotificationService,
    private excelExportService: ExcelExportService
  ) {
    this.queryBody={
      accountId:'',
      tnxType:"",
      fromDate: new Date('1/1/2023'),
      toDate: new Date(),
    }
  }

  ngOnInit(): void {
    this.fetchAccountHistory();
  }
  fetchAccountHistory(){
    const params: Map<string, any> = new Map();
    params.set("fromDate",this.queryBody.fromDate);
    params.set("toDate",this.queryBody.toDate);
    params.set("tnxType",this.queryBody.tnxType);
    params.set("accountId",this.accountId);
    this.clientService.getAccountHistoryListByAccountId(params).subscribe({
      next:(res)=>{
        if(res.isSuccess){
          this.accountHistory = res.body;
          this.openingBalance = this.accountHistory[0].previousBalance;
          this.closingBalance = 0;
          this.accountHistoryExportable = [];
          let sn = 0;
          
          this.accountHistory.map((elem) => {
            if(this.tnxSide =="DEBIT"){
              elem.tnxType=="DEBIT"?(this.closingBalance+=elem.tnxAmount):(this.closingBalance-=elem.tnxAmount)
            }else if(this.tnxSide =="CREDIT"){
              elem.tnxType=="CREDIT"?(this.closingBalance+=elem.tnxAmount):(this.closingBalance-=elem.tnxAmount)
            }
            let item = {
              SN: sn + 1,
              TNX_DATE: elem.tnxDate,
              PAYMENT_METHOD: elem.paymentMethod,
              COMMENT: elem.remark,
              DEBIT: elem.tnxType=="DEBIT"?elem.tnxAmount:0,
              CREDIT: elem.tnxType=="CREDIT"?elem.tnxAmount:0,
              BALANCE: (this.tnxSide =="DEBIT")?
              ((elem.tnxType == "DEBIT")?
              (elem.previousBalance + elem.tnxAmount):(elem.previousBalance - elem.tnxAmount))
              :((elem.tnxType == "CREDIT")?
              (elem.previousBalance + elem.tnxAmount):(elem.previousBalance - elem.tnxAmount))
            };
            this.accountHistoryExportable.push(item);
          });
          this.accountHistoryExportable.unshift({
            SN: '',
            TNX_DATE: '',
            PAYMENT_METHOD:'',
            COMMENT:'',
            DEBIT:'',
            CREDIT:'Opening',
            BALANCE:this.openingBalance
          });
        }else{
          this.notificationService.showErrorMessage("ERROR",res.message,"OK",200);
        }
      }
    })
  }
  export() {
    this.excelExportService.exportAsExcelFile(
      this.accountHistoryExportable,
      'ACCOUNT_STATEMENT'
    );
  }

}
