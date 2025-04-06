import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Account, Customer, Person } from '../../model/models';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.css']
})
export class AddCustomerComponent implements OnInit {
  @Output() customerAddedEvent = new EventEmitter<string>();
  clientForm!: FormGroup;
  person : Person = new Person();
  customer: Customer = new Customer();
  account: Account = new Account();
  errMsg: string = '';
  isCustomerExist: boolean = false;
  showLoader: boolean = false;
  isEdit: boolean = false;
  isLengthError: boolean = false;
  balanceTitle: string = "Balance";
  constructor(
    private formBuilder:FormBuilder,
    private clientService: ClientService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.prepareForm();
  }
  prepareForm() {
    this.clientForm = this.formBuilder.group({
      id: [''],
      name: [''],
      shopName:[''],
      contactNo: [''],
      address: [''],
      balance:[0],
    });
  }
  searchCustomer() {
    if(this.person.contactNo.length<11){
      this.isLengthError =true;
      return;
    }else{
      this.isLengthError =false;
    }
    this.showLoader  = true;
    this.clientService.getClientByContactNo(this.person.contactNo).subscribe({
      next: (res) => {
        this.showLoader  = false;
        if (res.body) {
          this.notificationService.showMessage(
            'SUCCESS!',
            'Person Found',
            'OK',
            2000
          );
          this.person = res.body;
          if (res.body.customer) {
            this.customer = res.body.customer;
            this.account = this.customer.account;
            if (this.account.balance < 0) {
              this.balanceTitle = 'Due';
            } else {
              this.balanceTitle = 'Balance';
            }
            this.isCustomerExist = true;
          } else {
            this.errMsg =
              '** This person is not a Customer, Please Add as a Customer';
            this.isCustomerExist = false;
          }
        } else {
          this.person.personAddress = '';
          this.person.personName = '';
          this.person.id = 0;
          this.isCustomerExist = false;
          return;
        }
      },
      error: (err) => {
        this.isCustomerExist = false;
        this.notificationService.showMessage(
          'ERROR!',
          'Customer Found Failed' + err.message,
          'OK',
          2000
        );
      },
      complete: () => {},
    });
  }
  addCustomer() {
    this.showLoader = true;
    const params: Map<string, any> = new Map();
    let customerModel = {
      personId: this.person.id,
      clientType: 'CUSTOMER',
      personName: this.person.personName,
      contactNo: this.person.contactNo,
      personAddress: this.person.personAddress,
      shopName: this.customer.shopName,
      shopAddress: this.customer.shopAddress,
      // regNo: this.customer.regNo
    };
    params.set('client', customerModel);

    this.clientService.addClient(params).subscribe({
      next: (res) => {
        if (res.body) {
          
          this.isCustomerExist = true;
        }
        this.errMsg ="";
        this.notificationService.showMessage(
          'SUCCESS!',
          'Client Add Successful',
          'OK',
          1000
        );
        this.person = new Person();
        this.customer = new Customer();
      },
      error:(err)=>{
        this.notificationService.showErrorMessage(
          'ERROR!',
          'Client Add Failed ' +err.message,
          'OK',
          1000
        );
      },
      complete:()=>{
        this.showLoader = false;
      }
    });
  }

}
