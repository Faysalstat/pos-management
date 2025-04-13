import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientIssueModel, Customer, Person } from '../../model/models';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-add-supplyer',
  templateUrl: './add-supplyer.component.html',
  styleUrls: ['./add-supplyer.component.css']
})
export class AddSupplyerComponent implements OnInit {
  supplyerAddingForm!:FormGroup;
  customer!: Customer;
  person!: Person;
  companyName!: string;
  brand!: string;
  shopName!: string;
  code!:string; 
  regNo!:string;  
  isCustomerExist: boolean = false;
  isSupplyerExist: boolean = false;
  showLoader:boolean = false;  
  errMsg: string = '';
  constructor(
    private formBuilder:FormBuilder,
    private clientService: ClientService,
    private notificationService: NotificationService
  ) { 
    this.person = new Person();
  }

  ngOnInit(): void {
    this.prepareForm(null);
  }
  prepareForm(formData: any) {
    if (!formData) {
      formData = new ClientIssueModel();
    }
    this.supplyerAddingForm = this.formBuilder.group({
      id: [formData.id],
      companyName: [formData.companyName],
      shopName: [formData.shopName,[Validators.required]],
      code: [formData.code,[Validators.required]],
      regNo: [formData.regNo],
      brandName: [formData.brandName,[Validators.required]],
      contactNo: [formData.contactNo],
      website: [formData.website],
      personName: [formData.personName],
      personAddress: [formData.personAddress],
      email: [formData.email],
    });

    this.supplyerAddingForm.get("code")?.valueChanges.subscribe((data)=>{
      const params:Map<string,any> = new Map();
      params.set("code",data);
      params.set("id",'');
      this.clientService.getSupplyerByCode(params).subscribe({
        next:(res)=>{
          if(res.body){
            this.supplyerAddingForm.get('companyName')?.setValue(res.body.companyName);
            this.supplyerAddingForm.get('shopName')?.setValue(res.body.shopName);
            this.supplyerAddingForm.get('website')?.setValue(res.body.website);
            this.supplyerAddingForm.get('brandName')?.setValue(res.body.brand);
            this.supplyerAddingForm.get('regNo')?.setValue(res.body.regNo);
            this.person = res.body.person;
            this.isSupplyerExist = true;
          }else{
            this.isSupplyerExist = false;
          }
          
        },
        error:(err)=>{

        }
      })
    })
  }
  

addSupplyer(){
  if (this.supplyerAddingForm.invalid ) {
    if(!this.person.contactNo || this.person.contactNo!='' || this.person.personName!='' ){
      this.notificationService.showMessage("WARNING!","Form Invalid, Add Person Information","OK",1000);
      return;
    }
    this.notificationService.showMessage("WARNING!","Form Invalid","OK",1000);
    return;
  }
  this.showLoader = true;
  let supplyerModel = this.supplyerAddingForm.value;
  supplyerModel.clientType= "SUPPLYER";
  supplyerModel.personId = this.person.id;
  supplyerModel.personName=this.person.personName;
  supplyerModel.contactNo=this.person.contactNo;
  supplyerModel.personAddress=this.person.personAddress;
  supplyerModel.email=this.person.email;
  const params:Map<string,any> = new Map();
  params.set("client",supplyerModel);
  console.log(supplyerModel);
  this.clientService.addClient(params).subscribe({

      // this.supplyerModel.type="",

    next:(res)=>{
      this.showLoader = false;
      this.supplyerAddingForm.reset();
      this.person  = new Person();
      this.notificationService.showMessage("SUCCESS!","Supplyer Add Successful","OK",1000);
    },
    error:(err)=>{
      this.showLoader = false;
      this.notificationService.showMessage("FAILED!","Supplyer Add Failed "+err.message,"OK",1000);
    },
    complete:()=>{
      this.showLoader = false;
    }
  })
}

searchClientByContactNo() {
  this.clientService.getClientByContactNo(this.person.contactNo).subscribe({
    next: (res) => {
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
          this.isCustomerExist = true;
        } else {
          this.errMsg =
            '** This person is not a Customer, Please Add as a Customer';
          this.isCustomerExist = false;
        }
      } else {
        this.customer.person.personAddress = '';
        this.customer.person.personName = '';
        this.customer.person.id = 0;
        this.isCustomerExist = false;
        return;
      }
    },
    error: (err) => {
      this.isCustomerExist = false;
      console.log(err.message);
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
}
