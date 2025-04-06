import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToWords } from 'to-words';
import { ScehduleDelivery, Supplyer } from '../../model/models';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';
import { PdfMakeService } from '../../services/pdf-make.service';

@Component({
  selector: 'app-edit-invoice',
  templateUrl: './edit-invoice.component.html',
  styleUrls: ['./edit-invoice.component.css'],
})
export class EditInvoiceComponent implements OnInit {
  id!: any;
  supplyer!: Supplyer;
  supplyOrders: any[] = [];
  supplyInvoice: any;
  selectedOrderItem: any;
  delieverySchedule: ScehduleDelivery = new ScehduleDelivery();
  isPending: boolean = false;
  isDelivered: boolean = false;
  errMsg: string = '';
  isDue: boolean = false;
  payment: any;
  totalPaid: number = 0;
  duePayment: number = 0;
  rebate: number = 0;
  comment!: string;
  selection = new SelectionModel<any>(true, []);
  supplyOrdersForSchedule: any[] = [];
  deliveryDisable:boolean = false;
  toWords = new ToWords();
  
  constructor(
    private route:Router,
    private activatedRoute: ActivatedRoute,
    private inventoryService: InventoryService,
    private notificationService: NotificationService,
    private pdfMakeService: PdfMakeService
  ) {
    this.payment = {
      invoiceId: 0,
      newPayment: 0,
      newRebate: 0,
      newDueAmount: 0,
    };
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((parameter) => {
      this.id = parameter['id'];
      this.fetchInvoiceDetailsByID();
    });
  }
  fetchInvoiceDetailsByID() {
    this.inventoryService.fetchSupplyInvoiceById(this.id).subscribe({
      next: (res) => {
        this.supplyer = res.body.supplyer;
        this.supplyOrders = res.body.supplyOrders;
        this.isPending = false;
        this.supplyInvoice = res.body;
        this.totalPaid = res.body.totalPaid;
        this.duePayment = res.body.duePayment;
        this.rebate = res.body.rebate;
        this.comment = res.body.remarks;
        if (this.supplyInvoice.duePayment > 0) {
          this.isDue = true;
        }
        this.supplyOrdersForSchedule = [];
        for (let i = 0; i < this.supplyOrders.length; i++) {
          if (this.supplyOrders[i].deliveryStatus == 'PENDING') {
            this.isPending = true;
            break;
          }
        }
        
        this.supplyOrders.map((elem) => {
          if (elem.deliveryStatus != 'DELIVERED') {
            this.supplyOrdersForSchedule.push(elem);
          }
        });
      },
      error: (err) => {
        this.notificationService.showMessage('ERROR', err.message, 'OK', 1000);
      },
    });
  }

  addDelievrySchedule(order: any) {
    let deliveryModel = {};
    if (order != null) {
      deliveryModel = {
        orderId: order.id,
        deliverableQuantity: order.qunatityDeliveryPending,
        scheduledDate: new Date(),
        deliveryStatus: 'DELIVERED',
        isSupply: true,
        state: 'OPEN',
        invoiceId: order.supplyInvoiceId,
      };
    } else {
      deliveryModel = {
        orderId: this.selectedOrderItem.id,
        invoiceId: this.supplyInvoice.id,
        deliverableQuantity: this.delieverySchedule.deliverableQuantity,
        scheduledDate: this.delieverySchedule.scheduledDate,
        deliveryStatus: 'DELIVERED',
        isSupply: true,
        state: 'OPEN',
      };
    }
    const params: Map<string, any> = new Map();
    params.set('delivery', deliveryModel);
    this.inventoryService.issueSupplyOrderDelievery(params).subscribe({
      next: (res) => {
        console.log(res.body);
        this.delieverySchedule = new ScehduleDelivery();
        this.fetchInvoiceDetailsByID();
      },
      error: (err) => {
        this.notificationService.showMessage(
          'ERROR',
          'DELIVERY ADD FAILED',
          'OK',
          500
        );
      },
    });
  }
  onSelectOrder(event:any) {
    this.selectedOrderItem = event.source.value;
    if (this.selectedOrderItem.deliveryStatus == 'DELIVERED') {
      
      this.isDelivered = true;
      this.errMsg = '*This Product delivery is completed!';
    } else {
      
      this.isDelivered = false;
      this.errMsg = '';
    }
  }

  onChangeDelievredQuantity() {
    if (this.delieverySchedule.deliverableQuantity > this.selectedOrderItem.qunatityDeliveryPending) {
      this.deliveryDisable = true;
      this.errMsg =
        '*Delivered Quantity is Greater Than Remaining Order Quantity';
      return;
    } else {
      this.deliveryDisable = false;
      this.errMsg = '';
    }

    if(this.selectedOrderItem.qunatityDeliveryPending==0){
      this.selectedOrderItem.deliveryStatus = 'DELIVERED';
    }else{
      this.selectedOrderItem.deliveryStatus = 'PENDING';
    }
  }
  calculateNewSummary() {
    this.supplyInvoice.totalPaid = this.totalPaid + this.payment.newPayment;
    this.supplyInvoice.rebate = this.rebate + this.payment.newRebate;
    this.supplyInvoice.duePayment =
      this.supplyInvoice.totalPrice -
      this.supplyInvoice.totalPaid -
      this.supplyInvoice.rebate;
  }
  updateComment() {
    let inviceModel = {
      comment: this.comment,
      invoiceId: this.supplyInvoice.id,
    };
    const params: Map<string, any> = new Map();
    params.set('invoice', inviceModel);
    this.inventoryService.updateSupplyInvoice(params).subscribe({
      next: (res) => {
        console.log(res.body);
        this.notificationService.showMessage(
          'SUCCESS',
          'Invoice Updated',
          'OK',
          500
        );
      },
    });
  }

  deliverAll() {
    let selectedOrders = this.selection.selected;
    for (let i = 0; i < selectedOrders.length; i++) {
      let order = selectedOrders[i];
      if (order.deliveryStatus != 'DELIVERED') {
        let deliveryModel = {
          orderId: order.id,
          deliverableQuantity: order.qunatityDeliveryPending,
          scheduledDate: new Date(),
          deliveryStatus: 'DELIVERED',
          isSupply: true,
          state: 'OPEN',
          invoiceId: order.supplyInvoiceId,
        };
        const params: Map<string, any> = new Map();
        params.set('delivery', deliveryModel);
        this.inventoryService.issueSupplyOrderDelievery(params).subscribe({
          next: (res) => {
            this.fetchInvoiceDetailsByID();
            this.selection = new SelectionModel<any>(true, []);
          },
          error: (err) => {
            this.notificationService.showMessage(
              'ERROR',
              'DELIVERY ADD FAILED',
              'OK',
              500
            );
          },
        });
      }
    }
  }

   /** Whether the number of selected elements matches the total number of rows. */
   isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.supplyOrders.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.supplyOrders.forEach((row) =>{
            this.selection.select(row)
          });
  }
  showReturnPanel(ev: boolean) {
    this.route.navigate(["/layout/supply/return-supply-order",this.supplyInvoice.id]);
  }
  downloadInvoice() {
    let orders: any[] = [];
    let index = 1;
    let totalPayableAmount = this.supplyInvoice.totalPrice - this.supplyInvoice.rebate;
    this.supplyOrders.forEach((elem: any) => {
      let orderRow = [];
      orderRow.push(index);
      orderRow.push(elem.product.productName);
      orderRow.push(elem.pricePerUnit);
      orderRow.push(elem.packageQuantity);
      orderRow.push(elem.looseQuantity);
      orderRow.push(elem.quantityOrdered + ' ' + elem.product.unitType);
      orderRow.push(elem.totalPrice);
      index++;
      orders.push(orderRow);
    });
    let invoiceModel = {
      doNo: '',
      invoiceId: this.supplyInvoice.invoiceNo,
      issuedBy: localStorage.getItem('personName'),
      supplyer: this.supplyer,
      tnxDate: this.supplyInvoice.purchaseDate,
      supplierName: this.supplyer.person.personName,
      customerAddress: this.supplyer.person.personAddress,
      totalPrice: this.supplyInvoice.totalPrice,
      balance: this.supplyer.account.balance,
      totalPayableAmount: totalPayableAmount,
      totalPriceInWords: this.toWords.convert(totalPayableAmount),
      discount: this.supplyInvoice.rebate,
      orders: orders,
    };
    this.pdfMakeService.downloadSupplyInvoice(invoiceModel);
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
