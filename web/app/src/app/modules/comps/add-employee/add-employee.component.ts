import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Account, Employee, Person } from '../../model/models';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css'],
})
export class AddEmployeeComponent implements OnInit {
  clientForm!: FormGroup;
  person: Person = new Person();
  employee: Employee = new Employee();
  account: Account = new Account();
  errMsg: string = '';
  isEmployeeExist: boolean = false;
  isPersonExist: boolean = false;
  showLoader: boolean = false;
  isEdit: boolean = false;
  balanceTitle: string = 'Balance';
  constructor(
    private formBuilder: FormBuilder,
    private clientService: ClientService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.prepareForm();
  }
  prepareForm() {
    this.clientForm = this.formBuilder.group({
      id: [''],
      employeeId: ['', [Validators.required]],
      designation: ['', [Validators.required]],
      joiningDate: [''],
      role: ['', [Validators.required]],
      balance: [0],
    });
  }
  searchCustomer() {
    this.showLoader = true;
    this.clientService.getClientByContactNo(this.person.contactNo).subscribe({
      next: (res) => {
        this.showLoader = false;
        if (res.body) {
          this.notificationService.showMessage(
            'SUCCESS!',
            'Person Found',
            'OK',
            2000
          );
          this.person = res.body;
          this.isPersonExist = true;
          if (res.body.employee) {
            this.employee = res.body.employee;
            this.account = this.employee.account;
            if (this.account.balance < 0) {
              this.balanceTitle = 'Due';
            } else {
              this.balanceTitle = 'Balance';
            }
            this.isEmployeeExist = true;
          } else {
            this.errMsg =
              '** This person is not a Employee, Please Add as an Employee';
            this.isEmployeeExist = false;
          }
        } else {
          this.person.personAddress = '';
          this.person.personName = '';
          this.person.id = 0;
          this.person.nId = '';
          this.person.email = '';
          this.isEmployeeExist = false;
          return;
        }
      },
      error: (err) => {
        this.isEmployeeExist = false;
        this.notificationService.showMessage(
          'ERROR!',
          'Employee Found Failed' + err.message,
          'OK',
          2000
        );
      },
      complete: () => {},
    });
  }

  searchEmployeeByEmployeeId() {
    let code = this.clientForm.get('employeeId')?.value;
    const params: Map<string, any> = new Map();
    params.set('employeeId', code);
    params.set('id', '');
    this.clientService.getEmployeeByCodeOrID(params).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.notificationService.showMessage(
            'SUCCESS!',
            'Employee Found',
            'OK',
            2000
          );
          this.clientForm.get('designation')?.setValue(res.body.designation);
          this.clientForm.get('role')?.setValue(res.body.role);
          this.clientForm.get('joiningDate')?.setValue(res.body.joiningDate);
          this.clientForm.get('designation')?.disabled;
          this.clientForm.get('role')?.disabled;
          this.clientForm.get('joiningDate')?.disabled;
        } else {
          this.clientForm.get('designation')?.setValue('');
          this.clientForm.get('role')?.setValue('');
          this.clientForm.get('joiningDate')?.setValue('');
          this.clientForm.get('designation')?.enabled;
          this.clientForm.get('role')?.enabled;
          this.clientForm.get('joiningDate')?.enabled;
        }
      },
    });
  }

  addEmployee() {
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
    let employeeModel = {
      personId: this.person.id,
      personName: this.person.personName,
      personAddress: this.person.personAddress,
      contactNo: this.person.contactNo,
      email: this.person.email,
      nId: this.person.nId,
      fatherName: this.person.fatherName,
      clientType: 'EMPLOYEE',
      employeeId: this.clientForm.get('employeeId')?.value,
      designation: this.clientForm.get('designation')?.value,
      joiningDate: this.clientForm.get('joiningDate')?.value,
      role: this.clientForm.get('role')?.value,
    };
    params.set('client', employeeModel);
    this.clientService.addClient(params).subscribe({
      next: (res) => {
        if (res.body) {
          this.showLoader = false;
          this.person = new Person();
          this.clientForm.reset();
          this.errMsg = '';
          this.notificationService.showMessage(
            'SUCCESS!',
            'Client Add Successful',
            'OK',
            1000
          );
        }
      },
    });
  }
}
