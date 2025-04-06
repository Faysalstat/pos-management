import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Account, Person } from '../../model/models';
import { ClientService } from '../../services/client.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.css'],
})
export class EmployeeDetailsComponent implements OnInit {
  client!: any;
  person: Person = new Person();
  account: Account = new Account();
  accountHistory: any[] = [];
  accountHistoryExportable: any[] = [];
  employee: any = {};
  showAccountHistory: boolean = false;
  accountId!:any;
  tnxTypes: any[];
  showLoader:boolean = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private clientService: ClientService,
    private notificationService: NotificationService,
    private excelExportService: ExcelExportService
  ) {
    this.tnxTypes = [
      { label: 'All', value: '' },
      { label: 'Debit', value: 'DEBIT' },
      { label: 'Credit', value: 'CREDIT' },
    ];
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((parameter) => {
      let id = parameter['id'];
      this.fetchAccountDetailsById(id);
    });
  }
  fetchAccountDetailsById(id: any) {
    this.showLoader = true;
    const params: Map<string, any> = new Map();
    params.set('id', id);
    this.clientService.getPersonById(id).subscribe({
      next: (res) => {
        this.person = res.body;
        if (res.body.employee) {
          this.employee = res.body.employee;
          this.account = res.body.employee.account;
          this.accountId = this.account.id;
        }
      },
      error:(err)=>{
        this.notificationService.showNotFoundErrorMessage("Person",200);
      },
      complete:()=>{
        this.showLoader = false;
      }
    });
  }
  showHistory(event: boolean) {
    this.showAccountHistory = event;
  }
  updateEmployee() {
    const params: Map<string, any> = new Map();
    let employeeModel = {
      clientType: 'EMPLOYEE',
      personName: this.person.personName,
      personAddress: this.person.personAddress,
      personId: this.person.id,
      email: this.person.email,
      designation: this.employee.designation,
      role: this.employee.role,
    };
    params.set('client', employeeModel);
    this.clientService.updateClient(params).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.notificationService.showMessage(
            'SUCCESS',
            res.message,
            'OK',
            300
          );
        } else {
          this.notificationService.showErrorMessage(
            'ERROR',
            res.message,
            'OK',
            300
          );
        }
      },
      error: (err) => {
        this.notificationService.showErrorMessage(
          'ERROR',
          err.message,
          'OK',
          300
        );
      },
    });
  }
}
