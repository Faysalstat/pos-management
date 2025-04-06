import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToWords } from 'to-words';
import { Tasks } from '../../model/models';
import { ClientService } from '../../services/client.service';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';
import { PdfMakeService } from '../../services/pdf-make.service';

@Component({
  selector: 'app-approval-details',
  templateUrl: './approval-details.component.html',
  styleUrls: ['./approval-details.component.css'],
})
export class ApprovalDetailsComponent implements OnInit {
  taskId!: any;
  taskDetail!: any;
  invoiceDetails!: any;
  supplyer!:any;
  customer!:any;
  comment:string= "";
  isStock:boolean = false;
  taskType:string = '';
  showLoader: boolean = false;
  isDue: boolean = false;
  dueAmount:number = 0;
  userName:any;
  toWords = new ToWords();
  constructor(
    private activatedRoute: ActivatedRoute,
    private inventoryService: InventoryService,
    private clientService: ClientService,
    private notificationService : NotificationService,
    private router: Router,
    private pdfMakeService: PdfMakeService
  ) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('username');
    this.fetchPayloadByTaskId();
  }

  fetchPayloadByTaskId() {
    this.showLoader  = true;
    this.activatedRoute.params.subscribe((parameter) => {
      let id = parameter['id'];
      this.taskId = id;
      
      this.inventoryService.fetchTaskById(this.taskId).subscribe({
        next: (res) => {
          this.showLoader  = false;
          this.taskDetail = res.body;
          this.invoiceDetails = res.body.payload;
          this.comment = this.invoiceDetails.comment;
          this.taskType = res.body.taskType;
          this.fetchClientById(res.body);
        },
      });
    });
  }

  fetchClientById(taskDetail:any) {
    if (taskDetail.taskType == 'CREATE_SUPPLY') {
      this.isStock = true;
      const params: Map<string, any> = new Map();
      params.set('id',taskDetail.payload.supplyerId);
      params.set('code', '');
      this.clientService.getSupplyerByCode(params).subscribe({
        next: (res) => {
          if (res.body) {
            this.supplyer = res.body;
            let due = (this.supplyer.account.balance - this.invoiceDetails.totalPrice + this.invoiceDetails.rebate);
            if(due<0){
              this.isDue = true;
              this.dueAmount = Math.abs(due);
            }else{
              this.isDue = false;
            }
          }
        },
      });
    } else {
      this.isStock = false;
      this.clientService.getCustomerById(taskDetail.payload.customerId).subscribe({
        next:(res)=>{
          console.log(res.body);
          this.customer = res.body
        }
      })
    }
  }
  submitOrder(){
    this.showLoader  = true;
      this.invoiceDetails.taskId = this.taskId;
      this.invoiceDetails.comment = this.comment;
      this.invoiceDetails.approvedBy = this.userName
      const params: Map<string, any> = new Map();
      if(this.isStock){
        params.set('order', this.invoiceDetails);
        this.inventoryService.issueBuyOrder(params).subscribe({
          next: (res) => {
            this.downloadSupplyInvoice(res.body.invoiceNo);
            this.notificationService.showMessage(
              'SUCCESS!',
              'Invoice Created',
              'OK',
              2000
            );
            
            this.router.navigate(['/layout/admin/task-list']);
          },
          error: (err) => {
            this.notificationService.showMessage(
              'ERROR!' + err.message,
              'Invoice Not Created',
              'OK',
              2000
            );
          },
          complete:()=>{
            this.showLoader  = false;
          }
        });
      }else{
        params.set('invoice', this.invoiceDetails);
        this.inventoryService.issueSalesOrder(params).subscribe({
          next:(res)=>{
            this.showLoader  = false;
            if(res.isSuccess){
              this.notificationService.showMessage("SUCCESS",res.message,"OK",2000);
              this.downloadSaleInvoice(res.body.invoiceNo);
              this.router.navigate(['/layout/admin/task-list']);
            }else{
              this.notificationService.showMessage("ERROR","Order Placed Failed" + res.message,"OK",2000);
            }
            
          },
          error:(err)=>{
            this.showLoader  = false;
            this.notificationService.showMessage("ERROR","Order Placed Failed" + err.message,"OK",2000);
          }
        })
      }
      
  }

  declineApproval(){
    this.showLoader  = true;
    const params: Map<string, any> = new Map();
    let task = {
      taskId: this.taskId
    }
    params.set("task",task)
    this.inventoryService.declineApproval(params).subscribe({
      next:(res)=>{
        this.showLoader  = false;
        this.notificationService.showMessage("SUCCESSFULL","Approval Deleted","OK",500);
        this.router.navigate(['/layout/admin/task-list']);
      },
      error:(err)=>{
        this.showLoader  = false;
        this.notificationService.showErrorMessage("Warning","Deletion Failed","Ok",500);
      }
    })
  }

  applyFilter(date: any) {
    // let newDate = new Date(date);
    console.log(date);
    let newDate = date;
    return (
      newDate.getDate() +
      '/' +
      (newDate.getMonth() + 1) +
      '/' +
      newDate.getFullYear()
    );
  }

  downloadSaleInvoice(invoiceNo:any) {
    let orders: any[] = [];
    let index = 1;
    let person = this.customer.person;
    this.invoiceDetails.orders.forEach((elem: any) => {
      let orderRow = [];
      orderRow.push(index);
      orderRow.push(elem.productName);
      orderRow.push(elem.pricePerUnit);
      orderRow.push(elem.packageQuantity);
      orderRow.push(elem.looseQuantity);
      orderRow.push(elem.quantityOrdered + ' ' + elem.unitType);
      orderRow.push(elem.totalOrderPrice);
      index++;
      orders.push(orderRow);
    });
    let invoiceModel = {
      doNo: '',
      invoiceId: invoiceNo,
      issuedBy: localStorage.getItem('personName'),
      customer: this.customer,
      tnxDate: this.applyFilter(new Date()),
      customerName: person.personName,
      customerAddress: person.personAddress,
      totalPrice: this.invoiceDetails.totalPrice,
      previousBalance: this.invoiceDetails.previousBalance,
      totalPayableAmount: this.invoiceDetails.totalPayableAmount,
      totalPayableAmountInWords: this.toWords.convert(Math.abs(this.invoiceDetails.totalPayableAmount)),
      totalPaid: this.invoiceDetails.totalPaidAmount,
      discount: this.invoiceDetails.rebate,
      orders: orders,
      dueAmount: this.invoiceDetails.totalPayableAmount - this.invoiceDetails.totalPaidAmount,
      extraCharge: this.invoiceDetails.extraCharge,
      chargeReason:
          this.invoiceDetails.chargeReason != ''
          ? this.invoiceDetails.chargeReason
          : 'Extra Charge',
    };
    this.pdfMakeService.downloadSaleInvoice(invoiceModel);
  }
  downloadSupplyInvoice(inoviceNo:any) {
    let orders: any[] = [];
    let totalPaable = +(this.invoiceDetails.totalPrice - this.invoiceDetails.rebate).toFixed(2);
    let index = 1;
    let person = this.supplyer.person;
    this.invoiceDetails.orders.forEach((elem: any) => {
      let orderRow = [];
      orderRow.push(index);
      orderRow.push(elem.productName);
      orderRow.push(elem.pricePerUnit);
      orderRow.push(elem.packageQuantity);
      orderRow.push(elem.looseQuantity);
      orderRow.push(elem.quantityOrdered + ' ' + elem.unitType);
      orderRow.push(elem.totalOrderPrice);
      index++;
      orders.push(orderRow);
    });
    let invoiceModel = {
      doNo: '',
      invoiceId: inoviceNo,
      issuedBy: localStorage.getItem('personName'),
      supplyer: this.supplyer,
      tnxDate: this.applyFilter(new Date()),
      supplierName: person.personName,
      customerAddress: person.personAddress,
      totalPrice: this.invoiceDetails.totalPrice,
      balance: this.supplyer.account.balance,
      totalPayableAmount: totalPaable,
      totalPriceInWords: this.toWords.convert(totalPaable),
      discount: this.invoiceDetails.rebate,
      orders: orders,
    };
    this.pdfMakeService.downloadSupplyInvoice(invoiceModel);
  }
  showPositive(number: any) {
    return Math.abs(Number(number));
  }
}
