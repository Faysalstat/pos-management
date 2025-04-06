import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Account, Customer, Person, Supplyer } from '../../model/models';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.css']
})
export class ClientDetailsComponent implements OnInit {
  client!:any;
  person:Person = new Person();
  customerAccount:Account = new Account();
  supplyerAccount:Account = new Account();
  customerAccountistory: any[] = [];
  supplyerAccountistory: any[] = [];
  customer: Customer = new Customer();
  supplyer:Supplyer = new Supplyer();
  isCustomer: boolean = true;
  showAccountHistory:boolean = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private clientService:ClientService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((parameter) => {
      let id = parameter['id'];
      this.fetchAccountDetailsById(id);
    })
  }
  fetchAccountDetailsById(id:any){
    const params: Map<string, any> = new Map();
    params.set('id',id);
    this.clientService.getPersonById(id).subscribe({
      next:(res)=>{
        this.person = res.body;
        
        console.log(res.body);
        if(res.body.customer){
          this.isCustomer = true;
          this.customer = res.body.customer;
          this.customerAccount = res.body.customer.account;
          this.customerAccountistory = res.body.customer.account.accountHistories;
        }else if(res.body.supplyer){
          this.isCustomer = false;
          this.supplyer = res.body.supplyer;
          this.supplyerAccount = res.body.supplyer.account;
          this.supplyerAccountistory = res.body.supplyer.accountHistories;
        }
      }
    })
  }
  showHistory(event:boolean){
    if(event){
      this.showAccountHistory = true;
    }else{
      this.showAccountHistory = false;
    }

  }

}
