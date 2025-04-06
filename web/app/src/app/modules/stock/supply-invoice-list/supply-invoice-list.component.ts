import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authService';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-supply-invoice-list',
  templateUrl: './supply-invoice-list.component.html',
  styleUrls: ['./supply-invoice-list.component.css']
})
export class SupplyInvoiceListComponent implements OnInit {
  isListExist:boolean = false;
  supplyInvoiceList:any[] = [];
  offset = 0;
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100,500,1000];
  queryBody:any;
  userList:any[]=[];
  constructor(
    private route: Router,
    private inventoryService: InventoryService,
    private notificationService: NotificationService,
    private authService:AuthService
  ) { 
    this.queryBody={
      offset:0,
      limit:0,
      invoiceNo:'',
      code:'',
      deliveryStatus:'',
      fromDate: new Date('01-01-2023'),
      toDate: new Date(),
    }
  }

  ngOnInit(): void {
    this.fetchSupplyList();
    this.fetchUserList();
  }
  fetchUserList(){
    this.authService.getAllUser('').subscribe({
      next:(res)=>{
        let users = res.body;
        users.map((elem:any)=>{
          this.userList.push({label:elem.userName,value:elem.userName})
        })
      },
      error:(err)=>{
        this.notificationService.showErrorMessage("ERROR",err.message,"OK",300);
      }
    })
  }
  fetchSupplyList(){
    const params: Map<string, any> = new Map();
    this.queryBody.offset = this.offset;
    this.queryBody.limit = this.pageSize;
    params.set('query', this.queryBody);
    this.inventoryService.fetchAllSupplyInvoice(params).subscribe({
      next:(res)=>{
        if(res.body.length>0){
          this.isListExist = true;
        }else{
          this.isListExist = false;
        }
        this.supplyInvoiceList = res.body;
      },
      error:(err)=>{
        console.log(err);
        this.notificationService.showMessage("EROR!","Invoice List fetching failed","OK",2000);
      }
    })

  }
  pageChange(event:any){
    this.pageSize = event.pageSize;
    this.offset = this.pageSize * event.pageIndex;
    this.fetchSupplyList();
  }
  viewInvoice(invoice:any){
    this.route.navigate(["/layout/supply/edit-supply-invoice",invoice.id]);
  }
  refresh(){
    this.queryBody={
      offset:0,
      limit:0,
      invoiceNo:'',
      code:'',
      deliveryStatus:'',
      fromDate: new Date('01-01-2023'),
      toDate: new Date()
    }
    this.fetchSupplyList();
  }

}
