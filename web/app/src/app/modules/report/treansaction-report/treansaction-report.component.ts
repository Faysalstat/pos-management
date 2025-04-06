import { Component, OnInit } from '@angular/core';
import { ExcelExportService } from '../../services/excel-export.service';
import { NotificationService } from '../../services/notification-service.service';
import { ReportServiceService } from '../../services/report-service.service';

@Component({
  selector: 'app-treansaction-report',
  templateUrl: './treansaction-report.component.html',
  styleUrls: ['./treansaction-report.component.css']
})
export class TreansactionReportComponent implements OnInit {
  offset = 0;
  length = 1000;
  pageSize = 500;
  pageSizeOptions: number[] = [100,500,1000];
  transactionList:any[] = [];
  transactionListExportable:any[] = [];
  transactionCategories!:any[];
  tnxTypes!:any[];
  query!: any;
  totalDebit = 0;
  totalCredit = 0;
  constructor(
    private reportService: ReportServiceService,
    private notificationService:NotificationService,
    private excelExportServie :ExcelExportService
  ) { 
    this.query = {
      transactionType:"",
      tnxType:"",
      fromDate: new Date('1/1/2023'),
      toDate: new Date(),
      voucherNo:'',
      tnxCat:''
    }
    this.transactionCategories = [
      {label:'All Category', value:''},
      {label:'Income', value:'INCOME'},
      {label:'Expense', value:'EXPENSE'},
      {label:'Deposit', value:'DEPOSIT'}
    ];
    this.tnxTypes = [
      {label:'All Type', value:''},
      {label:'Debit', value:'DEBIT'},
      {label:'Credit', value:'CREDIT'}
    ]
  }

  ngOnInit(): void {
    this.fetchTransactionRecord();
  }
  fetchTransactionRecord(){
    const params: Map<string, any> = new Map();
    params.set('offset',this.offset);
    params.set('limit',this.pageSize);
    params.set('tnxType',this.query.tnxType);
    params.set('voucherNo',this.query.voucherNo || '');
    params.set('fromDate',this.query.fromDate);
    params.set('toDate',this.query.toDate);
    params.set('transactionCategory',this.query.tnxCat);
    this.reportService.fetchTransactionRecord(params).subscribe({
      next:(res)=>{
        console.log(res);
        this.totalDebit = 0;
        this.totalCredit = 0;
        this.transactionListExportable = [];
        this.transactionList= res.body.data;
        this.length = res.body.size;
        this.transactionList.map((elem)=>{
          let item = {
            TNX_TYPE:elem.transactionType,
            TNX_REASON:elem.transactionReason,
            DEBIT: elem.isDebit==1?elem.amount:0,
            CREDIT: elem.isDebit==0?elem.amount:0,
            TNX_DATE:elem.transactionDate,
            REMARK:elem.refference,
          };
          this.transactionListExportable.push(item);
          this.totalDebit += (elem.isDebit==1?elem.amount:0);
          this.totalCredit += (elem.isDebit==0?elem.amount:0);
        })
      },
      error:(err)=>{
        console.log(err.message)
      }
    })
  }
  exportAsExcel(){
      this.excelExportServie.exportAsExcelFile(this.transactionListExportable,"Tnx-Report");
  }
  pageChange(event:any){
    this.pageSize = event.pageSize;
    this.offset = this.pageSize * event.pageIndex;
    this.fetchTransactionRecord();
  }
}