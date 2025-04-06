import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { COFIGS, Tasks } from '../../model/models';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css'],
})
export class DepositComponent implements OnInit {
  @Output() depositEvent = new EventEmitter<string>();
  depositAmount!: number;
  depositType: string='';
  depositFrom: string='';
  paymentMethod: string='';
  comment!: String;
  types: any[];
  paymentMethods: any[];
  userName: any;
  isApprovalNeeded: boolean = false;
  isSubmitted: boolean = false;
  constructor(
    private notificationService: NotificationService,
    private transactionService: TransactionService,
    private inventoryService: InventoryService,
    private route:Router
  ) {
    this.types = [
      { label: 'Select Deposit Type', value: '' },
      { label: 'Director Investment', value: 'DIRECTOR_INVESTMENT' },
      { label: 'Loan', value: 'LOAN' },
      { label: 'Bank', value: 'BANK' },
      { label: 'Other', value: 'OTHER' },
    ];
    this.paymentMethods = [
      { label: 'Select Payment Method', value: '' },
      { label: 'BANK', value: 'BANK' },
      { label: 'BKASH', value: 'BKASH' },
      { label: 'CASH', value: 'CASH' },
    ];
  }
  ngOnInit(): void {
    this.userName = localStorage.getItem('username');
    this.fetchDepositTypes();
    this.getConfig(COFIGS.TRANSACTION_APPROVAL_NEEDED);
  }
  getConfig(configname: any) {
    this.inventoryService.getConfigByName(configname).subscribe({
      next: (res) => {
        if (res.body && res.body.value == 1) {
          this.isApprovalNeeded = true;
        } else {
          this.isApprovalNeeded = false;
        }
      },
    });
  }
  fetchDepositTypes() {}
  submit() {
    this.isSubmitted = true;
    if (!this.depositType || this.depositFrom == '' || !this.depositAmount) {
      this.notificationService.showErrorMessage(
        'INVALID',
        'Input All Data',
        'OK',
        200
      );
      return;
    }
    let expenseModel = {
      transactionReason: this.depositType,
      paymentMethod: this.paymentMethod,
      cashAmount: this.depositAmount,
      receivedBy: 'INVENTORY_GL',
      comment: this.comment,
      transactionType: 'DEPOSIT',
      issuedBy: localStorage.getItem("username"),
    };
    if (this.isApprovalNeeded) {
      let approvalModel = {
        payload: JSON.stringify(expenseModel),
        createdBy: this.userName,
        taskType: Tasks.DEPOSIT_TRANSACTION,
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
      });
    } else {
      const params: Map<string, any> = new Map();
      params.set('expenseModel', expenseModel);
      this.transactionService.doExpense(params).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.isSubmitted = false;
            this.depositAmount = 0;
            this.depositFrom = '';
            this.depositType = '';
            this.comment = '';
            this.depositEvent.emit('Balance Changed');
            this.notificationService.showMessage(
              'Success!',
              'Payment Complete',
              'OK',
              500
            );
          } else {
            this.notificationService.showErrorMessage(
              'ERROR!',
              res.message,
              'OK',
              500
            );
          }
        },
        error: (err) => {
          this.isSubmitted = false;
          console.log(err.message);
          this.notificationService.showErrorMessage(
            'ERROR!',
            'Operation Failed' + err.message,
            'OK',
            2000
          );
        },
      });
    }
  }
}
