import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Account, Employee, LoanClient, Person } from '../../model/models';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-add-loan-acc',
  templateUrl: './add-loan-acc.component.html',
  styleUrls: ['./add-loan-acc.component.css']
})
export class AddLoanAccComponent implements OnInit {
  clientForm!: FormGroup;
  loanAcc: LoanClient = new LoanClient();
  account: Account = new Account();
  errMsg: string = '';
  isAccExist: boolean = false;
  showLoader: boolean = false;
  isEdit: boolean = false;
  balanceTitle: string = 'Balance';
  clientList!: any[];
  constructor(
    private formBuilder: FormBuilder,
    private clientService: ClientService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.prepareForm();
    this.fetchAllLoanAcc();
  }
  prepareForm() {
    this.clientForm = this.formBuilder.group({
      id: [''],
      clientName: [''],
      clientDisc: [''],
      interestRate: ['']
    });
  }
  searchLoanAcc(){

  }

  addClient() {
    this.showLoader = true;
    if (this.clientForm.invalid) {
      this.showLoader = false;
      this.notificationService.showErrorMessage(
        'WARNING',
        'INVALID FORM',
        'OK',
        200
      );
      return;
    }
    const params: Map<string, any> = new Map();
    let loanAccModel = {
      clientName: this.loanAcc.clientName,
      clientDisc: this.loanAcc.clientDisc,
      clientType: 'LOAN_ACC',
    };
    params.set('client', loanAccModel);
    this.clientService.addClient(params).subscribe({
      next: (res) => {
        if (res.body) {
          this.showLoader = false;
          this.loanAcc = new LoanClient();
          this.clientForm.reset();
          this.errMsg = '';
          this.notificationService.showMessage(
            'SUCCESS!',
            'Client Add Successful',
            'OK',
            1000
          );
          this.fetchAllLoanAcc();
        }
      },
      error:(err)=>{
        this.showLoader = false;
        this.notificationService.showErrorMessage(
          'ERROR!',
          'Client Add Failed '+ err.message,
          'OK',
          1000
        );
      }
    });
  }
  fetchAllLoanAcc(){
    const params: Map<string, any> = new Map();
    params.set("clientType","LOAN_ACC");
    this.clientService.getAllClient(params).subscribe({
      next:(res)=>{
        console.log(res.body);
        this.clientList = res.body;
      },
      error:(err)=>{
        console.log(err.message)
      }
    })
  }
}
