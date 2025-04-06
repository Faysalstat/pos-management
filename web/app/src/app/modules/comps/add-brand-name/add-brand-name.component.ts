import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification-service.service';
import { ProductService } from '../../services/product-service.service';

@Component({
  selector: 'app-add-brand-name',
  templateUrl: './add-brand-name.component.html',
  styleUrls: ['./add-brand-name.component.css']
})
export class AddBrandNameComponent implements OnInit {
  brandName!:string;
  brandNames!:any[];
  constructor(
    private productService: ProductService,
    private notificationService : NotificationService
  ) { }

  ngOnInit(): void {
    this.fetchBrandNames();
  }

  addBrandName(){
    const params: Map<string, any> = new Map();
    let model = {
      key: this.brandName,
      value: this.brandName.toUpperCase()
    }
    params.set("model",model);
    this.productService.addBrnadName(params).subscribe({
      next:(res)=>{
        if(res.body){
          this.brandName = '';
          this.notificationService.showMessage("SUCCESS",res.message,"OK",500);
          this.fetchBrandNames();
        }
      }
    })
  }
  fetchBrandNames(){
    this.productService.fetchAllBrandName().subscribe({
      next:(res)=>{
        if(res.body){
          this.brandNames = res.body;
          
        }else{
          this.notificationService.showErrorMessage("ERROR","No Unit Type Found","OK",500);
        }
      }
    })
  }
  deleteItem(id:any){
    this.productService.deleteUnitType(id).subscribe({
      next:(res)=>{
        if(res.isSuccess){
          console.log("Successfully Deleted");
          this.notificationService.showErrorMessage("SUCCESS","Deleted Item","Ok",500);
          this.fetchBrandNames();
        }else{
          
          this.notificationService.showErrorMessage("ERROR","Deletion Failed","Ok",500);
        }
      }
    })
    
  }
}
