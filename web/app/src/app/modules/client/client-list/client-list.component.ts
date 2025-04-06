import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {
  clientList!:any[];
  clientTypes!:any[];
  selectedType:any = "SUPPLYER";
  showCustomerList: boolean = false;
  showSupplyerList: boolean = true;
  constructor(
    private formBuilder:FormBuilder,
    private clientService: ClientService,
    private notificationService: NotificationService,
    private route: Router
  ) {

    this.clientTypes = [
      {label:"Customer", value:"CUSTOMER"},
      {label:"Supplyer", value:"SUPPLYER"}
    ]
   }

  ngOnInit(): void {
    this.fetchClientList("SUPPLYER");
  }

  onTypeChange(){
    if(this.selectedType == "CUSTOMER"){
        this.showSupplyerList = false;
        this.showCustomerList = true;
    }else if(this.selectedType == "SUPPLYER"){
        this.showSupplyerList = true;
        this.showCustomerList = false;
    }
    this.fetchClientList(this.selectedType);
  }

  fetchClientList(clientType:any){
    this.clientService.getAllClient(clientType).subscribe({
      next:(res)=>{
        console.log(res.body);
        this.clientList = res.body;
      },
      error:(err)=>{
        console.log(err.message);
      }
    })
  }
  viewClient(id:any){
    if(this.showCustomerList){
      this.route.navigate(["/layout/client/customer-details",id]);
    }else{
      this.route.navigate(["/layout/client/supplyer-details",id]);
    }
    
  }
}

