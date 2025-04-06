import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification-service.service';
import { ProductService } from '../../services/product-service.service';

@Component({
  selector: 'app-product-category',
  templateUrl: './product-category.component.html',
  styleUrls: ['./product-category.component.css']
})
export class ProductCategoryComponent implements OnInit {
  category!:string;
  categories!:any[];
  constructor(
    private productService: ProductService,
    private notificationService : NotificationService
  ) { }

  ngOnInit(): void {
    this.fetchProductCategory();
  }

  addcategory(){
    const params: Map<string, any> = new Map();
    let model = {
      key: this.category,
      value: this.category.toUpperCase()
    }
    params.set("model",model);
    this.productService.addProductCategory(params).subscribe({
      next:(res)=>{
        if(res.body){
          this.category = '';
          this.notificationService.showMessage("SUCCESS",res.message,"OK",500);
          this.fetchProductCategory();
        }
      }
    })
  }

  fetchProductCategory(){
    this.productService.fetchAllProductCategory().subscribe({
      next:(res)=>{
        if(res.body){
          this.categories = res.body;
        }else{
          this.notificationService.showErrorMessage("ERROR","No Product Category Found","OK",500);
        }
      }
    })
  }
  deleteItem(id:any){
    this.productService.deleteProductCategory(id).subscribe({
      next:(res)=>{
        if(res.isSuccess){
          console.log("Successfully Deleted");
          this.notificationService.showErrorMessage("SUCCESS","Deleted Item","Ok",500);
          this.fetchProductCategory();
        }else{
          
          this.notificationService.showErrorMessage("ERROR","Deletion Failed","Ok",500);
        }
      }
    })
    
  }
}

