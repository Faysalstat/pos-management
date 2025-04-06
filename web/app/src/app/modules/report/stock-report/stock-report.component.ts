import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { type } from 'os';
import { ExcelExportService } from '../../services/excel-export.service';
import { NotificationService } from '../../services/notification-service.service';
import { ProductService } from '../../services/product-service.service';
import { ReportServiceService } from '../../services/report-service.service';

@Component({
  selector: 'app-stock-report',
  templateUrl: './stock-report.component.html',
  styleUrls: ['./stock-report.component.css'],
})
export class StockReportComponent implements OnInit {
  offset: number = 0;
  limit = 5;
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [100, 500, 1000];
  productList!: any[];
  productListExportable!: any[];
  categories: any[] = [];
  brandName: string = '';
  categoryName: string = '';
  code: string = '';
  totalProduct:number = 0;
  totalCostValue:number = 0;
  totalSellValue:number = 0;
  constructor(
    private productService: ProductService,
    private notificationService: NotificationService,
    private excelExportService: ExcelExportService
  ) {}

  ngOnInit(): void {
    this.fetchProductCategory();
    this.fetchAllProducts();
  }
  fetchProductCategory() {
    this.categories = [{ label: 'Select Category', value: '' }];
    this.productService.fetchAllProductCategory().subscribe({
      next: (res) => {
        if (res.body) {
          let categoryList = res.body;
          categoryList.map((elem: any) => {
            let option = { label: elem.key, value: elem.value };
            this.categories.push(option);
          });
        } else {
          this.notificationService.showErrorMessage(
            'ERROR',
            'No Product Category Found',
            'OK',
            500
          );
        }
      },
    });
  }

  fetchAllProducts() {
    this.productListExportable = [];
    const params: Map<string, any> = new Map();
    this.offset = this.offset;
    params.set('offset', this.offset);
    params.set('limit', this.pageSize);
    params.set('brandName', this.brandName);
    params.set('categoryName', this.categoryName);
    params.set('code', this.code);
    this.productService.fetchAllProduct(params).subscribe({
      next: (res) => {
        if (res) {
          this.productList = res.body;
          this.totalProduct = res.length;
          this.totalCostValue = 0;
          let sn = 0
          this.productList.forEach((product)=>{
            // need to the value type, from cost or from selling price? 
            this.totalCostValue += (product.quantity-product.quantitySold)* product.costPricePerUnit;
            this.totalSellValue += (product.quantity-product.quantitySold)* product.sellingPricePerUnit;

            let item = {
              SN:sn+1,
              ProductCode:product.productCode,
              ProductName:product.productName,
              BrandName:product.brandName,
              Quantity:this.packProduct(product),
              AvailableQuantity:(product?.quantity - product?.quantitySold)||0,
              BuyingPrice: product.costPricePerUnit,
              SellingPRice: product.sellingPricePerUnit
            }
            this.productListExportable.push(item);
          })
        }
      },
    });
  }
  pageChange(event: any) {
    this.pageSize = event.pageSize;
    this.offset = this.pageSize * event.pageIndex;
    this.fetchAllProducts();
  }
  packProduct(product: any) {
    let packQnt = '';
    let availableQuantity = product.quantity - product.quantitySold;
    if (product.unitPerPackage && product.packagingCategory) {
      packQnt =
        Math.floor(availableQuantity / product.unitPerPackage) +
        ' ' +
        product.packagingCategory +
        ' ' +
        (product.quantity % product.unitPerPackage) +
        ' ' +
        product.unitType;
    } else {
      packQnt = 'N/A';
    }
    return packQnt;
  }
  refreshFilter() {
    this.brandName = '';
    this.categoryName = '';
    this.code = '';
    this.fetchAllProducts();
  }
  export() {
    this.excelExportService.exportAsExcelFile(
      this.productListExportable,
      'STOCK_REPORT'
    );
  }
}
