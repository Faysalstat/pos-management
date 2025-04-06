import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
})
export class CustomerComponent implements OnInit {
  clientList!: any[];
  queryBody: any;
  constructor(
    private formBuilder: FormBuilder,
    private clientService: ClientService,
    private notificationService: NotificationService,
    private route: Router
  ) {
    this.queryBody = {
      contactNo:'',
      shopName:''
    }
  }

  ngOnInit(): void {
    this.fetchClientList();
  }

  fetchClientList() {
    const params: Map<string, any> = new Map();
    params.set("clientType","CUSTOMER");
    params.set("contactNo",this.queryBody.contactNo);
    params.set("shopName",this.queryBody.shopName);
    this.clientService.getAllClient(params).subscribe({
      next: (res) => {
        console.log(res.body);
        this.clientList = res.body;
      },
      error: (err) => {
        console.log(err.message);
      },
    });
  }
  viewClient(id: any) {
    if(localStorage.getItem("userRole")=="SALER"){
      return;
    }
    this.route.navigate(['layout/client/customer-details', id]);
  }

  refresh(){
    this.queryBody.contactNo  ='';
    this.queryBody.shopName  ='';
    this.fetchClientList();
  }
  export(){

  }
}
