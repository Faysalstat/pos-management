import { Component, OnInit } from '@angular/core';
import { ReportServiceService } from '../../services/report-service.service';

@Component({
  selector: 'app-profit-report',
  templateUrl: './profit-report.component.html',
  styleUrls: ['./profit-report.component.css'],
})
export class ProfitReportComponent implements OnInit {
  profitSummary!: any;
  totalProfitFromSale = 0;
  query!: any;
  isProfit: boolean = true;
  profitList: any[] = [];
  totalDiscount = 0;
  totalExtraCharge = 0;
  totalIncome = 0;
  totalProfit = 0;
  offset = 0;
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100,500,1000];
  constructor(private reportService: ReportServiceService) {
    this.query = {
      fromDate: new Date('01-01-2023'),
      toDate: new Date(),
      invoiceNo: '',
    };
  }

  ngOnInit(): void {
    this.fetchReportSummary();
  }
  fetchReportSummary() {
    this.totalIncome = 0;
    this.totalDiscount = 0;
    this.totalExtraCharge = 0;
    this.totalProfit = 0;
    const params: Map<string, any> = new Map();
    this.query.offset = this.offset;
    this.query.limit = this.pageSize;
    params.set('query', this.query);
    this.reportService.fetchProfitReport(params).subscribe({
      next: (res) => {
        this.profitSummary = res.body;
        this.profitList = res.body.invoiceList;
        this.profitList.map((elem) => {
          this.totalIncome += (+Number(elem.profitFromSale).toFixed(2));
          this.totalDiscount += (+Number(elem.discount).toFixed(2));
          this.totalExtraCharge += (+Number(elem.extraCharge).toFixed(2));
          
        });
        this.totalProfit = this.totalIncome - this.totalDiscount;
        let totalProfitFromSale =
          +Number(this.profitSummary.totalSellingPrice -
          this.profitSummary.totalBuyingPrice -
          this.profitSummary.totalDiscountGiven +
          this.profitSummary.totalExtraChargeTaken).toFixed(2);
        if (totalProfitFromSale < 0) {
          this.isProfit = false;
        } else {
          this.isProfit = true;
        }
        this.totalProfitFromSale = Math.abs(totalProfitFromSale);
      },
    });
  }
  pageChange(event:any){
    this.pageSize = event.pageSize;
    this.offset = this.pageSize * event.pageIndex;
    this.fetchReportSummary();
  }
}
