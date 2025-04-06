import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification-service.service';
import { ProductService } from '../../services/product-service.service';

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css'],
})
export class ProductManagementComponent implements OnInit {
  offset: number = 0;
  limit = 5;
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100, 500, 1000];
  productList!: any[];
  categories:any[] = [];
  brandName: string = '';
  categoryName: string = '';
  code: string = '';
  showLoader = false;
  constructor(
    private productService: ProductService,
    private notificationService: NotificationService,
    private route : Router
  ) {}

  ngOnInit(): void {
    this.fetchProductCategory();
    this.fetchAllProducts();
  }
  fetchProductCategory(){
    this.categories = [{ label: 'Select Category', value: '' }];
    this.productService.fetchAllProductCategory().subscribe({
      next:(res)=>{
        if(res.body){
          let categoryList = res.body;
          categoryList.map((elem:any)=>{
            let option = {label:elem.key,value: elem.value};
            this.categories.push(option);
          })
        }else{
          this.notificationService.showErrorMessage("ERROR","No Product Category Found","OK",500);
        }
      }
    })
  }

  fetchAllProducts() {
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
          console.log(res.body)
          this.productList = res.body;
        }
      },
    });
  }
  pageChange(event:any){
    this.pageSize = event.pageSize;
    this.offset = this.pageSize * event.pageIndex;
    this.fetchAllProducts();
  }
  onselectProduct(product:any){
    this.route.navigate(["/layout/supply/product-detail",product.id]);
  }
  packProduct(product:any){
    let packQnt ="";
    let availableQuantity = product.quantity - product.quantitySold;
    if(product.unitPerPackage && product.packagingCategory){
      packQnt = Math.floor(availableQuantity/product.unitPerPackage) 
      +" "+ product.packagingCategory
      +" "+(product.quantity%product.unitPerPackage)
      +" "+product.unitType
    }else{
      packQnt= "N/A";
    }
    return  packQnt;
  }
  refreshFilter(){
    this.brandName = '';
    this.categoryName = '';
    this.code = '';
    this.fetchAllProducts();
  }
}
