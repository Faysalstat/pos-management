import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tasks } from '../../model/models';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-loan-approval-details',
  templateUrl: './loan-approval-details.component.html',
  styleUrls: ['./loan-approval-details.component.css'],
})
export class LoanApprovalDetailsComponent implements OnInit {
  taskId!: number;
  taskDetail!: any;
  taskType!: any;
  showLoader: boolean = false;
  comment: string = '';
  updatedBalance: number = 0;
  userProfile: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private inventoryService: InventoryService,
    // private clientService: ClientService,
    private notificationService: NotificationService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userProfile = localStorage.getItem('username');
    this.fetchPayloadByTaskId();
  }

  fetchPayloadByTaskId() {
    this.activatedRoute.params.subscribe((parameter) => {
      let id = parameter['id'];
      this.taskId = id;
      this.inventoryService.fetchTaskById(this.taskId).subscribe({
        next: (res) => {
          console.log(res.body.payload);
          this.taskDetail = res.body.payload;
          this.taskType = res.body.taskType;
          this.comment = this.taskDetail.comment;
        },
      });
    });
  }

  declineApproval() {
    this.showLoader = true;
    const params: Map<string, any> = new Map();
    let task = {
      taskId: this.taskId,
    };
    params.set('task', task);
    this.inventoryService.declineApproval(params).subscribe({
      next: (res) => {
        this.showLoader = false;
        this.notificationService.showMessage(
          'SUCCESSFULL',
          'Approval Deleted',
          'OK',
          500
        );
        this.router.navigate(['/admin/task-list']);
      },
      error: (err) => {
        this.showLoader = false;
        this.notificationService.showErrorMessage(
          'Warning',
          'Deletion Failed',
          'Ok',
          500
        );
      },
      complete: () => {
        this.showLoader = false;
      },
    });
  }

  approveTransaction() {
    this.showLoader = true;
    const params: Map<string, any> = new Map();
    this.taskDetail.taskId = this.taskId;
    this.taskDetail.comment = this.comment;
    this.taskDetail.transactionType = "LOAN";
    this.taskDetail.approveBy = localStorage.getItem('username');
    params.set('expenseModel', this.taskDetail);
    this.transactionService.doExpense(params).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.notificationService.showMessage(
            'Success!',
            'Payment Complete',
            'OK',
            500
          );
          this.router.navigate(['/admin/task-list']);
        } else {
          this.showLoader = false;
          this.notificationService.showErrorMessage(
            'ERROR!',
            res.message,
            'OK',
            500
          );
        }
      },
      error: (err) => {
        this.showLoader = false;
        this.notificationService.showErrorMessage(
          'ERROR!',
          'Operation Failed' + err.message,
          'OK',
          2000
        );
      },
      complete: () => {
        this.showLoader = false;
      },
    });
  }

  applyFilter(date: any) {
    let newDate = new Date(date);
    return (
      newDate.getDate() +
      '/' +
      (newDate.getMonth() + 1) +
      '/' +
      newDate.getFullYear()
    );
  }
}
