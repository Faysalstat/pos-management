import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Account, Person, Supplyer } from '../../model/models';
import { ClientService } from '../../services/client.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-supplyer-details',
  templateUrl: './supplyer-details.component.html',
  styleUrls: ['./supplyer-details.component.css'],
})
export class SupplyerDetailsComponent implements OnInit {
  client!: any;
  person: Person = new Person();
  account: Account = new Account();
  tnxTypes: any[] = [];
  supplyer: any = {};
  showAccountHistory: boolean = false;
  accountId!:any;
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
    const params: Map<string, any> = new Map();
    params.set('code', '');
    params.set('id', id);
    this.clientService.getSupplyerByCode(params).subscribe({
      next: (res) => {
        this.supplyer = res.body;
        if (res.body.person) {
          this.person = res.body.person;
          this.account = res.body.account;
          this.accountId = this.account.id;
        }
      },
    });
  }

  showHistory(event: boolean) {
    this.showAccountHistory = event;
  }
  updateSupplyer() {
    const params: Map<string, any> = new Map();
    let supplyerModel = {
      clientType: 'SUPPLYER',
      personName: this.person.personName,
      personAddress: this.person.personAddress,
      personId: this.person.id,
      supplyerId: this.supplyer.id,
      email: this.person.email,
      companyName: this.supplyer.companyName,
      shopName: this.supplyer.shopName,
      shopAddress: this.supplyer.shopAddress,
      brand: this.supplyer.brand,
      regNo: this.supplyer.regNo,
      website: this.supplyer.website,
    };
    params.set('client', supplyerModel);
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
