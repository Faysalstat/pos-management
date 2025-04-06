import { Component, OnInit } from '@angular/core';
import { ReportServiceService } from '../../services/report-service.service';
import { ExcelExportService } from '../../services/excel-export.service';

@Component({
  selector: 'app-stock-supply-report',
  templateUrl: './stock-supply-report.component.html',
  styleUrls: ['./stock-supply-report.component.css']
})
export class StockSupplyReportComponent implements OnInit {
  offset:number = 0;
  limit = 5;
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  productList:any[] = [];
  productListExportable:any[] = [];
  queryBody!: any;
  constructor(
    private reportService: ReportServiceService,
    private excelExportService: ExcelExportService
  ) { 
    this.queryBody = {
      invoiceNo: '',
      productCode:'',
      fromDate: new Date('1/1/2023'),
      toDate: new Date(),
    }
  }

  ngOnInit(): void {
    this.fetchOrderRecord();
  }
  fetchOrderRecord(){
    this.queryBody.offset = this.offset;
    this.queryBody.limit = this.pageSize;
    this.productListExportable = []; 
    this.reportService.fetchStockSupplyReport(this.queryBody).subscribe({
      next:(res)=>{
        this.productList= res.body.data;
        this.length = res.body.length;
        console.log(res.body);
        let sn = 0;
        this.productList.map((elem) => {
          let item = {
            SN: sn + 1,
            Product_Code: elem.productCode,
            Product_Name: elem.productName,
            StockQNT: elem.stockQuantity,
            Qnt_Ordered: elem.quantityOrdered,
            Qnt_Delivered: elem.quantityDelivered,
            Qnt_Pending: elem.quantityPending,
            Qnt_Returned: elem.quantityReturned,
            Qnt_Damaged: elem.quantityDamaged,
          };
          this.productListExportable.push(item);
        });
      },
      error:(err)=>{
        console.log(err.message)
      }
    })
  }

  pageChange(event:any){
    this.pageSize = event.pageSize;
    this.offset = this.pageSize * event.pageIndex;
    this.fetchOrderRecord();
  }
  export() {
    this.excelExportService.exportAsExcelFile(
      this.productListExportable,
      'STOCK_REPORT'
    );
  }

}


