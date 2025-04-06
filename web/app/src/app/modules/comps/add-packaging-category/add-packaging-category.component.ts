import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification-service.service';
import { ProductService } from '../../services/product-service.service';

@Component({
  selector: 'app-add-packaging-category',
  templateUrl: './add-packaging-category.component.html',
  styleUrls: ['./add-packaging-category.component.css']
})
export class AddPackagingCategoryComponent implements OnInit {
  category!:string;
  categories!:any[];
  showLoader = false;
  constructor(
    private productService: ProductService,
    private notificationService : NotificationService
  ) { }

  ngOnInit(): void {
    this.fetchPackagingCategory();
  }

  addcategory(){
    this.showLoader = true;
    const params: Map<string, any> = new Map();
    let model = {
      key: this.category,
      value: this.category.toUpperCase()
    }
    params.set("model",model);
    this.productService.addPackagingCategory(params).subscribe({
      next:(res)=>{
        if(res.body){
          this.category = '';
          this.notificationService.showMessage("SUCCESS",res.message,"OK",500);
          this.fetchPackagingCategory();
          this.showLoader = false;
        }
      },
      error:(err)=>{
        this.notificationService.showErrorMessage("ERROR",err.message,"OK",500);
      },
      complete:()=>{
        this.showLoader = false;
      }
    })
  }

  fetchPackagingCategory(){
    this.productService.fetchAllPackagingCategory().subscribe({
      next:(res)=>{
        if(res.body){
          this.category = '';
          this.categories = res.body;
        }else{
          this.notificationService.showErrorMessage("ERROR","No Packaging Category Found","OK",500);
        }
      }
    })
  }
  deleteItem(id:any){
    this.productService.deletePackagingCategory(id).subscribe({
      next:(res)=>{
        if(res.isSuccess){
          console.log("Successfully Deleted");
          this.notificationService.showErrorMessage("SUCCESS","Deleted Item","Ok",500);
          this.fetchPackagingCategory();
        }else{
          
          this.notificationService.showErrorMessage("ERROR","Deletion Failed","Ok",500);
        }
      }
    })
    
  }
}


