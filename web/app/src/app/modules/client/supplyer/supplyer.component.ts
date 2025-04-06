import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-supplyer',
  templateUrl: './supplyer.component.html',
  styleUrls: ['./supplyer.component.css']
})
export class SupplyerComponent implements OnInit {
  clientList!:any[];
  queryBody:any;
  constructor(
    private formBuilder:FormBuilder,
    private clientService: ClientService,
    private notificationService: NotificationService,
    private route: Router
  ) {
this.queryBody = {
  code:'',
  companyName:'',
  brandName:''
}
   }

  ngOnInit(): void {
    this.fetchClientList();
  }
  fetchClientList(){
    const params: Map<string, any> = new Map();
    params.set("clientType","SUPPLYER");
    params.set("code",this.queryBody.code);
    params.set("companyName",this.queryBody.companyName);
    params.set("brandName",this.queryBody.brandName);
    this.clientService.getAllClient(params).subscribe({
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
    if(localStorage.getItem("userRole")=="SALER"){
      return;
    }
    this.route.navigate(["layout/client/supplyer-details",id]);
  }
  refresh(){
    this.queryBody.code  ='';
    this.queryBody.companyName  ='';
    this.queryBody.brandName  ='';
    this.fetchClientList();
  }
  export(){

  }
}