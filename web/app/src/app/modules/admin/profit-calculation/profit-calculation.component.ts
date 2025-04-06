import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-profit-calculation',
  templateUrl: './profit-calculation.component.html',
  styleUrls: ['./profit-calculation.component.css']
})
export class ProfitCalculationComponent implements OnInit {
  incomeAccountHistoryList!:any[];
  extraChargeAccountHistoryList!:any[];
  expenseAccountHistoryList!:any[];
  totalProfit = 0;
  totalIncome = 0;
  totalExpense = 0;
  totalExtraCharge = 0;
  queryBody!:any;
  showLoader:boolean = false;
  constructor(
    private clientService: ClientService,
    private notificationService: NotificationService,
    // private excelExportService: ExcelExportService
  ) {
    this.queryBody={
      fromDate: new Date('1/1/2023'),
      toDate: new Date(),
    }
  }

  ngOnInit(): void {
    this.fetchProfitCalculationData();
  }

  fetchProfitCalculationData(){
    const params: Map<string, any> = new Map();
    params.set("fromDate",this.queryBody.fromDate);
    params.set("toDate",this.queryBody.toDate);
    this.showLoader = true;
    this.clientService.getAccountHistoryForProfitCalculation(params).subscribe({
      next:(res)=>{
        this.totalIncome=0;
        this.totalExpense=0;
        this.totalExtraCharge=0;
        this.incomeAccountHistoryList = res.body.incomeAccountHistories;
        this.extraChargeAccountHistoryList = res.body.extraChargeAccountHistories;
        this.expenseAccountHistoryList = res.body.expenseAccountHistories;
        this.incomeAccountHistoryList.map((elem)=>{
          let tnxAmount = +(Number(elem.tnxAmount).toFixed(2));
          elem.tnxType=='CREDIT'?(this.totalIncome += tnxAmount):(this.totalIncome -= tnxAmount)
        })
        this.extraChargeAccountHistoryList.map((elem)=>{
          let tnxAmount = +(Number(elem.tnxAmount).toFixed(2));
          elem.tnxType=='CREDIT'?(this.totalExtraCharge += tnxAmount):(this.totalExtraCharge -= tnxAmount)
        })
        this.expenseAccountHistoryList.map((elem)=>{
          let tnxAmount = +(Number(elem.tnxAmount).toFixed(2));
          elem.tnxType=='DEBIT'?(this.totalExpense += tnxAmount):(this.totalExpense -= tnxAmount)
        })
      },
      error:(err)=>{
        this.notificationService.showErrorMessage("ERROR","Calculation Data Fetching Failed: Error "+err.message,"Ok",1000);
      },
      complete:()=>{
        this.showLoader = false;
      }
    })
  }

}
