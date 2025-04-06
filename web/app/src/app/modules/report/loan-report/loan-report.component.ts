import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExcelExportService } from '../../services/excel-export.service';
import { NotificationService } from '../../services/notification-service.service';
import { ReportServiceService } from '../../services/report-service.service';

@Component({
  selector: 'app-loan-report',
  templateUrl: './loan-report.component.html',
  styleUrls: ['./loan-report.component.css'],
})
export class LoanReportComponent implements OnInit {
  loanList: any[] = [];
  loanListExportable: any[] = [];
  constructor(
    private reportService: ReportServiceService,
    private route: Router,
    private excelExportServie: ExcelExportService
  ) {}

  ngOnInit(): void {
    this.fetchLoanRegistry();
  }
  fetchLoanRegistry() {
    this.loanListExportable = [];
    this.reportService.fetchLoanList().subscribe({
      next: (res) => {
        this.loanList = res.body;
        let index = 0;
        this.loanList.map((elem)=>{
          let item = {
            SN: index+1,
            CLIENT:elem.loanClient?.clientName,
            LOAN_AMOUNT:elem.loanAmmount,
            LOAN_BALANCE: elem.account.balance,
            RECEIVE_DATE: elem.receiveDate,
            RETURN_DATE:elem.returnDate,
            REMARK:elem.remark,
          };
          index++;
          this.loanListExportable.push(item);
        })
      },
    });
  }

  exportAsExcel() {
    this.excelExportServie.exportAsExcelFile(
      this.loanListExportable,
      'Loan-Report'
    );
  }
  viewDetails(id:any){
    this.route.navigate(["cash/loan-details",id]);
  }
}
