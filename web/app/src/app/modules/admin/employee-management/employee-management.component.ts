import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-employee-management',
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.css']
})
export class EmployeeManagementComponent implements OnInit {
  clientList!: any[];
  clientExportList!: any[];
  queryBody: any;
  showLoader:boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private clientService: ClientService,
    private notificationService: NotificationService,
    private route: Router,
    private excelExportService : ExcelExportService
  ) {
    this.queryBody = {
      contactNo:'',
      employeeId:'',
      designation:'',
      role:''
    }
  }

  ngOnInit(): void {
    this.fetchClientList();
  }

  fetchClientList() {
    this.showLoader = true;
    const params: Map<string, any> = new Map();
    params.set("clientType","EMPLOYEE");
    params.set("contactNo",this.queryBody.contactNo);
    params.set("employeeId",this.queryBody.employeeId);
    params.set("designation",this.queryBody.designation);
    params.set("role",this.queryBody.role);
    this.clientService.getAllClient(params).subscribe({
      next: (res) => {
        this.clientList = res.body;
        let sn = 0;
        this.clientExportList = [];
        this.clientList.map((elem)=>{
          let item = {
            SN: sn+1,
            Name: elem.person.personName,
            ContactNo: elem.person.contactNo,
            EmployeeID: elem.employeeId,
            Designation: elem.designation,
            Role: elem.role,
          };
          this.clientExportList.push(item);
        })
      },
      error: (err) => {
        console.log(err.message);
      },
      complete:()=>{
        this.showLoader = false;
      }
    });
  }
  viewClient(id: any) {
    this.route.navigate(['layout/admin/employee-details', id]);
  }

  refresh(){
    this.queryBody = {
      contactNo:'',
      employeeId:'',
      designation:'',
      role:''
    }
    this.fetchClientList();
  }
  export(){
    this.excelExportService.exportAsExcelFile(this.clientExportList,"EMPLOYEE_RECORD");
  }
}
