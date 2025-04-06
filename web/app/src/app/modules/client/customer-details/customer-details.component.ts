import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Account, Customer, Person } from '../../model/models';
import { ClientService } from '../../services/client.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.css'],
})
export class CustomerDetailsComponent implements OnInit {
  client!: any;
  person: Person = new Person();
  account: Account = new Account();
  customer: any = {};
  showAccountHistory: boolean = false;
  accountId:any;
  tnxTypes:any[];
  constructor(
    private activatedRoute: ActivatedRoute,
    private clientService: ClientService,
    private notificationService: NotificationService,
    private excelExportService: ExcelExportService
  ) {
    this.tnxTypes = [
      {label:"All", value:''},
      {label:"Debit", value:"DEBIT"},
      {label:"Credit", value:"CREDIT"},
    ]

  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((parameter) => {
      let id = parameter['id'];
      this.fetchAccountDetailsById(id);
    });
  }
  fetchAccountDetailsById(id: any) {
    const params: Map<string, any> = new Map();
    params.set('id', id);
    this.clientService.getPersonById(id).subscribe({
      next: (res) => {
        this.person = res.body;
        if (res.body.customer) {
          this.customer = res.body.customer;
          this.account = res.body.customer.account;
          this.accountId = this.account.id;
        }
      },
    });
  }
  showHistory(event: boolean) {
    this.showAccountHistory = event;
    
  }
  updateCustomer(){
    const params: Map<string, any> = new Map();
    let customerModel = {
      clientType : "CUSTOMER",
      personName: this.person.personName,
      personAddress: this.person.personAddress,
      personId: this.person.id,
      email: this.person.email,
      customerId: this.customer.id,
      shopName:this.customer.shopName,
      shopAddress:this.customer.shopAddress,
    }
    params.set("client",customerModel);
    this.clientService.updateClient(params).subscribe({
      next:(res)=>{
        if(res.isSuccess){
          this.notificationService.showMessage("SUCCESS",res.message,"OK",300);
        }else{
          this.notificationService.showErrorMessage("ERROR",res.message,"OK",300);
        }
      },
      error:(err)=>{
        this.notificationService.showErrorMessage("ERROR",err.message,"OK",300);
      }
    })
    
  }

}
