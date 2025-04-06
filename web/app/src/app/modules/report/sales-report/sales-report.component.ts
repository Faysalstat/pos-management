import { Component, OnInit } from '@angular/core';
import { ExcelExportService } from '../../services/excel-export.service';
import { ReportServiceService } from '../../services/report-service.service';

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.css']
})
export class SalesReportComponent implements OnInit {
  offset:number = 0;
  limit = 5;
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  orderList:any[] = [];
  orderListExportable:any[] = [];
  statusOptions!:any[];
  queryBody!: any;
  constructor(
    private reportService: ReportServiceService,
    private excelExportService: ExcelExportService
  ) { 
    this.queryBody = {
      deliveryStatus:'',
      invoiceNo: '',
      orderNo:'',
      productCode:'',
      fromDate: new Date('1/1/2023'),
      toDate: new Date(),
    }
    this.statusOptions = [
      {label:'All', value:''},
      {label:'Delivered', value:'DELIVERED'},
      {label:'Pending', value:'PENDING'}
    ]
  }

  ngOnInit(): void {
    this.fetchOrderRecord();
  }
  fetchOrderRecord(){
    this.queryBody.offset = this.offset;
    this.queryBody.limit = this.pageSize;
    this.orderListExportable = []; 
    this.reportService.fetchOrderListRecord(this.queryBody).subscribe({
      next:(res)=>{
        this.orderList= res.body.data;
        this.length = res.body.length;
        console.log(res.body);
        let sn = 0;
        this.orderList.map((elem) => {
          let item = {
            SN: sn + 1,
            OrderNo: elem.orderNo,
            Product: elem.product.productName,
            QunatityOrdered: elem.quantityOrdered,
            QunatityDelivered: elem.quantityDelivered,
            QunatityDeliveryPending: elem.qunatityDeliveryPending,
            Total_Price: elem.totalPrice,
            Profit_Amount: (elem.pricePerUnit-elem.buyingPricePerUnit ) * (Math.abs(elem.quantityOrdered)),
            TNX_Date: elem.supplyInvoice?.purchaseDate,
            Delivery_Status: elem.deliveryStatus,
          };
          this.orderListExportable.push(item);
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
      this.orderListExportable,
      'STOCK_REPORT'
    );
  }

}

