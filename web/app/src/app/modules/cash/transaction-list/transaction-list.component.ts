import { Component, OnInit } from '@angular/core';
import { ExcelExportService } from '../../services/excel-export.service';
import { NotificationService } from '../../services/notification-service.service';
import { ReportServiceService } from '../../services/report-service.service';
import { ToWords } from 'to-words';
import { PdfMakeService } from '../../services/pdf-make.service';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit {
  offset = 0;
  length = 100;
  pageSize = 100;
  pageSizeOptions: number[] = [100,500,1000];
  transactionList:any[] = [];
  transactionListExportable:any[] = [];
  transactionType!:any[];
  tnxTypes!:any[];
  query!: any;
  totalDebitAmount = 0;
  totalCreditAmount = 0;
  toWords = new ToWords();
  showLoader:boolean = false;
  constructor(
    private reportService: ReportServiceService,
    private notificationService:NotificationService,
    private excelExportServie :ExcelExportService,
    private pdfMakeService: PdfMakeService,
    private clientService: ClientService
  ) { 
    this.query = {
      transactionType:"",
      tnxType:"",
      fromDate:'',
      toDate:'',
      voucherNo:''
    }
    this.transactionType = [
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
    params.set('voucherNo',this.query.voucherNo);
    params.set('fromDate',this.query.fromDate);
    params.set('toDate',this.query.toDate);
    params.set('transactionCategory','CASH_TRANSACTION');
    this.reportService.fetchTransactionRecord(params).subscribe({
      next:(res)=>{
        console.log(res.body.data)
        this.transactionListExportable = [];
        this.transactionList= res.body.data;
        this.length = res.body.size;
        this.totalCreditAmount = 0;
        this.totalDebitAmount = 0;
        this.transactionList.map((elem)=>{
          let item = {
            TNX_TYPE:elem.transactionType,
            TNX_REASON:elem.transactionReason,
            DEBIT: elem.income,
            CREDIT: elem.expense,
            TNX_DATE:elem.transactionDate,
            REMARK:elem.refference,
          };
          this.transactionListExportable.push(item);
          this.totalCreditAmount += elem.isDebit==1?0:elem.amount;
          this.totalDebitAmount += elem.isDebit==0?0:elem.amount;

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
  downloadMemo(tnxModel:any){
    let data: any[] = [];
    let tnxAmount = tnxModel.amount;
    let tnxDate = this.applyFilter(new Date());
    let debitAmount = (tnxModel.isDebit==1?tnxModel.amount:0);
    let creditAmount = (tnxModel.isDebit==0?tnxModel.amount:0);
    data.push(['1',tnxDate,tnxModel.paymentMethod,debitAmount,creditAmount]);
    const params: Map<string, any> = new Map();
    params.set("accountId",tnxModel.accountNo);
    this.showLoader = true;
    this.clientService.getClientByAccountId(params).subscribe({
      next:(res)=>{
        let model = {
          voucher: tnxModel.voucherNo || "",
          issuedBy: tnxModel.issuedBy,
          customer: res.body.customer,
          supplier: res.body.supplyer,
          tnxDate: this.applyFilter(new Date()),
          clientName: res.body.customer?.person.personName || res.body.supplyer?.person.personName,
          tnxAmount: tnxAmount,
          tnxType: tnxModel.transactionType,
          tnxAmountInWords: this.toWords.convert(
            tnxAmount || 0
          ),
          data:data
        };
        if(tnxModel.transactionReason == "RETURN_TO_CUSTOMER" || tnxModel.transactionReason == "CUSTOMER_PAYMENT"){
          this.pdfMakeService.downloadCustomerPaymentInvoice(model);
        }else if(tnxModel.transactionReason == "PAYMENT_TO_SUPPLIER" || tnxModel.transactionReason == "RETURN_FROM_SUPPLIER"){
          this.pdfMakeService.downloadSupplyerPaymentInvoice(model);
        }
      },
      error:(err)=>{
        console.log(err.message);
        this.notificationService.showErrorMessage("ERROR",err.message,"OK",500);
      },
      complete:()=>{
        this.showLoader = false;
      }
    })
    
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
}
