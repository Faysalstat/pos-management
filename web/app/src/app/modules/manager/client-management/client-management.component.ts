import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-client-management',
  templateUrl: './client-management.component.html',
  styleUrls: ['./client-management.component.css']
})
export class ClientManagementComponent implements OnInit {
  clientList!:any[];
  clientTypes!:any[];
  selectedType:any = "SUPPLYER";
  showCustomerList: boolean = false;
  showSupplyerList: boolean = true;
  constructor(
    private formBuilder:FormBuilder,
    private clientService: ClientService,
    private notificationService: NotificationService
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

}
