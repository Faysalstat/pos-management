import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tasks } from '../../model/models';
import { ClientService } from '../../services/client.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';
import { ReportServiceService } from '../../services/report-service.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-loan-details',
  templateUrl: './loan-details.component.html',
  styleUrls: ['./loan-details.component.css'],
})
export class LoanDetailsComponent implements OnInit {
  loanId!: any;
  loanAccount!: any;
  comment: string = '';
  showAccountHistory: boolean = false;
  showInstallmentPanel: boolean = false;
  accountHistory: any[] = [];
  accountHistoryExportable: any[] = [];
  installmentModel: any = {};
  paymentMethods: any[];
  isApprovalNeeded: boolean = false;
  id:any;
  accountId!:any;
  showLoader: boolean = false;
  constructor(
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private reportService: ReportServiceService,
    private inventoryService: InventoryService,
    private transactionService: TransactionService,
    private clientService: ClientService,
    private excelExportService:ExcelExportService
  ) {
    this.installmentModel = {
      installMentAmount: 0,
      interestAmount: 0,
      payingDate: new Date(),
      paymentMethod: 'CASH',
      loanAccount: 0,
    };
    this.paymentMethods = [
      { label: 'Select Payment Method', value: '' },
      { label: 'CASH', value: 'CASH' },
      { label: 'BANK', value: 'BANK' },
      { label: 'BKASH', value: 'BKASH' },
    ];
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((parameter) => {
      this.id = parameter['id'];
      this.fetchDetailsBID(this.id);
    });
  }
  fetchDetailsBID(id: any) {
    this.reportService.fetchLoanDetails(id).subscribe({
      next: (res) => {
        this.loanAccount = res.body;
        this.comment = this.loanAccount.remark;
        this.accountId = this.loanAccount.account.id;
      },
    });
  }
  showHistory(event: boolean) {
    this.showAccountHistory = event;
    this.showInstallmentPanel = false;
  }
  showInstallment(event: boolean) {
    this.showAccountHistory = false;
    this.showInstallmentPanel = event;
  }
  payInstallment() {
    this.showLoader = true;
    this.installmentModel.loanAccount = this.loanAccount.account.id;
    if (this.isApprovalNeeded) {
      let approvalModel = {
        payload: JSON.stringify(this.installmentModel),
        createdBy: localStorage.getItem('username'),
        taskType: Tasks.PAYMENT_TRANSACTION,
        status: 'OPEN',
      };
      const params: Map<string, any> = new Map();
      params.set('approval', approvalModel);
      this.inventoryService.sendToApproval(params).subscribe({
        next: (res) => {
          this.notificationService.showMessage(
            'SUCCESS!',
            'Approval Sent',
            'OK',
            500
          );
          this.route.navigate(['/layout/cash/transaction-list']);
        },
        error: (err) => {
          this.notificationService.showMessage(
            'Failed!',
            'Approval Sending Failed. ' + err.message,
            'OK',
            500
          );
        },
        complete:()=>{
          this.showLoader = false;
        }
      });
    } else {
      const params: Map<string, any> = new Map();
      params.set('installment', this.installmentModel);
      this.transactionService.payInstallment(params).subscribe({
        next: (res) => {
          this.notificationService.showMessage(
            'SUCCESS',
            'PAYMENT SUCCESSFULL',
            '5K',
            200
          );
          this.installmentModel = {
            installMentAmount: 0,
            interestAmount: 0,
            payingDate: new Date(),
            paymentMethod: 'CASH',
            loanAccount: 0,
          };
          this.fetchDetailsBID(this.id);
        },
        error:(err)=>{
          this.notificationService.showMessage(
            'SUCCESS',
            'PAYMENT Failed '+err.message,
            '5K',
            200
          );
        },
        complete:()=>{
          this.showLoader = false;
        }
      });
    }
  }
}
