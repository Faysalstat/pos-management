import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification-service.service';
import { ProductService } from '../../services/product-service.service';

@Component({
  selector: 'app-unit-type',
  templateUrl: './unit-type.component.html',
  styleUrls: ['./unit-type.component.css']
})
export class UnitTypeComponent implements OnInit {
  unitType!:string;
  unitTypes!:any[];
  constructor(
    private productService: ProductService,
    private notificationService : NotificationService
  ) { }

  ngOnInit(): void {
    this.fetchUnitType();
  }

  addunitType(){
    const params: Map<string, any> = new Map();
    let model = {
      key: this.unitType,
      value: this.unitType.toUpperCase()
    }
    params.set("model",model);
    this.productService.addUnitType(params).subscribe({
      next:(res)=>{
        if(res.body){
          this.unitType = '';
          this.notificationService.showMessage("SUCCESS",res.message,"OK",500);
          this.fetchUnitType();
        }
      }
    })
  }
  fetchUnitType(){
    this.productService.fetchAllUnitType().subscribe({
      next:(res)=>{
        if(res.body){
          this.unitTypes = res.body;
          
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
          this.fetchUnitType();
        }else{
          
          this.notificationService.showErrorMessage("ERROR","Deletion Failed","Ok",500);
        }
      }
    })
    
  }
}
