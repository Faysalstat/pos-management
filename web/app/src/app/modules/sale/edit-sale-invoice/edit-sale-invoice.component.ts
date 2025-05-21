import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer, IOrderBody, OrderItem, ReceiptBody, ScehduleDelivery } from '../../model/models';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';
import { PdfMakeService } from '../../services/pdf-make.service';
import { ToWords } from 'to-words';
import { ElementRef } from '@angular/core';
@Component({
  selector: 'app-edit-sale-invoice',
  templateUrl: './edit-sale-invoice.component.html',
  styleUrls: ['./edit-sale-invoice.component.css'],
})
export class EditSaleInvoiceComponent implements OnInit {
  @ViewChild('receiptComponent', { static: false, read: ElementRef })
  PrintableReceiptComponent!: ElementRef;
  id!: any;
  customer!: Customer;
  saleOrders: any[] = [];
  saleOrdersForSchedule: any[] = [];
  saleInvoice: any;
  selectedOrderItem: any;
  delieverySchedule: ScehduleDelivery = new ScehduleDelivery();
  isDue: boolean = false;
  isDelivered: boolean = false;
  errMsg: string = '';
  payment: any;
  totalPaid: number = 0;
  duePayment: number = 0;
  rebate: number = 0;
  allDeliveryStatus: boolean = false;
  isPending: boolean = false;
  comment: string = '';
  selection = new SelectionModel<any>(true, []);
  deliveryDisable: boolean = false;
  toWords = new ToWords();
  isShowReturnPanel: boolean = false;
  saleOrdersForReduce!: any[];
  orderItems:IOrderBody[] = [];
  receiptModel:ReceiptBody;
  constructor(
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private inventoryService: InventoryService,
    private notificationService: NotificationService,
    private pdfMakeService: PdfMakeService
  ) {
    this.receiptModel = new ReceiptBody();
    this.payment = {
      invoiceId: 0,
      newPayment: 0,
      newRebate: 0,
      newDueAmount: 0,
      remarks: '',
    };

  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((parameter) => {
      this.id = parameter['id'];
      this.fetchInvoiceDetailsByID();
    });
  }
  fetchInvoiceDetailsByID() {
    this.inventoryService.fetchSaleInvoiceById(this.id).subscribe({
      next: (res) => {
        console.log(res.body);
        this.customer = res.body.customer;
        this.saleOrders = res.body.orders;
        this.payment.invoiceId = this.id;
        this.saleInvoice = res.body;
        this.totalPaid = res.body.totalPaid;
        this.duePayment = res.body.duePayment;
        this.rebate = res.body.rebate;
        this.comment = res.body.comment;
        if (this.saleInvoice.duePayment > 0) {
          this.isDue = true;
        }
        this.saleOrdersForSchedule = [];
        this.saleOrdersForReduce = [];
        this.saleOrders.map((item)=>{
          this.orderItems.push({
            item: item.product.productName,
            rate: item.pricePerUnit,
            qty: item.quantityOrdered,
            total: item.totalPrice,
          })
        })
        for (let i = 0; i < this.saleOrders.length; i++) {
          if (this.saleOrders[i].deliveryStatus == 'PENDING') {
            this.isPending = true;
            break;
          }
        }
        this.receiptModel.invoiceNo = this.saleInvoice.invoiceNo;
        // After fetching invoice details, set these fields on the receipt model
        this.receiptModel.extraCharge = this.saleInvoice.extraCharge || 0;
        this.receiptModel.extraChargeReason = this.saleInvoice.chargeReason || '';
        this.receiptModel.orders = this.orderItems;
        this.receiptModel.subTotal = this.saleInvoice?.totalPrice;
        this.receiptModel.total = this.saleInvoice?.totalPayableAmount;
        this.receiptModel.discount = this.saleInvoice?.rebate;
        this.receiptModel.issuedBy = localStorage.getItem('personName') || '';
        this.receiptModel.customerName = this.customer?.person?.personName;
        this.receiptModel.cutomerContact = this.customer?.person?.contactNo;
        this.saleOrders.map((elem) => {
          if (elem.deliveryStatus != 'DELIVERED') {
            this.saleOrdersForSchedule.push(elem);
          }
          if (elem.state == 'SOLD') {
            this.saleOrdersForReduce.push(elem);
          }
        });
      },
      error: (err) => {
        this.notificationService.showMessage('ERROR', err.message, 'OK', 1000);
      },
    });
  }
  calculateNewSummary() {
    this.saleInvoice.totalPaid = this.totalPaid + this.payment.newPayment;
    this.saleInvoice.rebate = this.rebate + this.payment.newRebate;
    this.saleInvoice.duePayment =
      this.saleInvoice.totalPrice -
      this.saleInvoice.totalPaid -
      this.saleInvoice.rebate;
  }
  submitPayment() {
    const params: Map<string, any> = new Map();
    let paymentModel = {
      invoiceId: this.saleInvoice.id,
      accountId: this.customer.account.id,
      newPayment: this.payment.newPayment,
      updatedPaidAmount: this.saleInvoice.totalPaid,
      updatedDueAmount: this.saleInvoice.duePayment,
      updatedRebateAmount: this.saleInvoice.rebate,
      remarks: this.payment.remarks,
    };
    params.set('payment', paymentModel);
    console.log(paymentModel);
    this.inventoryService.doNewPaymentTransaction(params).subscribe({
      next: (res) => {
        console.log(res.body);
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
  async addDelievrySchedule(order: any) {
    let deliveryModel = {};
    if (order != null) {
      deliveryModel = {
        orderId: order.id,
        deliverableQuantity: order.qunatityDeliveryPending,
        scheduledDate: new Date(),
        deliveryStatus: 'DELIVERED',
        isSupply: false,
        state: 'OPEN',
        invoiceId: order.saleInvoiceId,
      };
    } else {
      deliveryModel = {
        orderId: this.selectedOrderItem.id,
        deliverableQuantity: this.delieverySchedule.deliverableQuantity,
        scheduledDate: this.delieverySchedule.scheduledDate,
        deliveryStatus: 'DELIVERED',
        isSupply: false,
        state: 'OPEN',
        invoiceId: this.selectedOrderItem.saleInvoiceId,
      };
    }
    this.doDelievery(deliveryModel);
  }
  async deliverAll() {
    let deliveryModel = {};
    let selectedOrders = this.selection.selected;
    for (let i = 0; i < selectedOrders.length; i++) {
      let order = selectedOrders[i];
      if (order.deliveryStatus == 'PENDING') {
        deliveryModel = {
          orderId: order.id,
          deliverableQuantity: order.qunatityDeliveryPending,
          scheduledDate: new Date(),
          deliveryStatus: 'DELIVERED',
          isSupply: false,
          state: 'OPEN',
          invoiceId: order.saleInvoiceId,
        };
        this.doDelievery(deliveryModel);
        this.selection = new SelectionModel<any>(true, []); 
      }
    }
    this.fetchInvoiceDetailsByID();
  }
  async doDelievery(deliveryModel: any) {
    const params: Map<string, any> = new Map();
    params.set('delivery', deliveryModel);
    this.inventoryService.issueSupplyOrderDelievery(params).subscribe({
      next: (res) => {
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
  onSelectOrder(event: any) {
    this.selectedOrderItem = event.source.value;
    if (this.selectedOrderItem.deliveryStatus == 'DELIVERED') {
      this.isDelivered = true;
      this.errMsg = '*This Product delivery is completed!';
    } else {
      this.isDelivered = false;
      this.errMsg = '';
    }
  }



  downloadInvoice() {
    let orders: any[] = [];
    let index = 1;
    this.saleOrders.forEach((elem: any) => {
      console.log(elem)
      let orderRow = [];
      orderRow.push(index);
      orderRow.push(elem.product.productName);
      orderRow.push(elem.pricePerUnit);
      orderRow.push(elem.packageQuantity);
      orderRow.push(elem.looseQuantity);
      orderRow.push(elem.quantityOrdered + ' ' + (elem.product.unitType).trim());
      orderRow.push(elem.totalPrice);
      index++;
      orders.push(orderRow);
    });
    let invoiceModel = {
      doNo: '',
      invoiceId: this.saleInvoice.invoiceNo,
      issuedBy: localStorage.getItem('personName'),
      customer: this.customer,
      tnxDate: this.applyFilter(new Date()),
      customerName: this.customer.person.personName,
      customerAddress: this.customer.person.personAddress,
      totalPrice: this.saleInvoice.totalPrice,
      previousBalance: this.saleInvoice.previousBalance,
      totalPayableAmount: this.saleInvoice.totalPayableAmount || 0,
      totalPayableAmountInWords: this.toWords.convert(
        this.saleInvoice.totalPayableAmount || 0
      ),
      totalPaid: this.saleInvoice.totalPaidAmount || 0,
      discount: this.saleInvoice.rebate || 0,
      dueAmount:
        (this.saleInvoice.totalPayableAmount || 0) - (this.saleInvoice.totalPaidAmount || 0),
      orders: orders,
      extraCharge: this.saleInvoice.extraCharge || 0,
      chargeReason: this.saleInvoice.chargeReason,
    };
    this.pdfMakeService.downloadSaleInvoice(invoiceModel);
  }
  onChangeDelievredQuantity() {
    if (
      this.delieverySchedule.deliverableQuantity >
      this.selectedOrderItem.qunatityDeliveryPending
    ) {
      this.errMsg =
        '*Deliverable Quantity is Greater Than Remaining Order Quantity';
      this.deliveryDisable = true;
    } else {
      this.deliveryDisable = false;
      this.errMsg = '';
    }
    if (this.selectedOrderItem.qunatityDeliveryPending == 0) {
      this.selectedOrderItem.deliveryStatus = 'DELIVERED';
    } else {
      this.selectedOrderItem.deliveryStatus = 'PENDING';
    }
  }
  onChangeReduceQuantity() {}
  updateComment() {
    let inviceModel = {
      comment: this.comment,
      invoiceId: this.saleInvoice.id,
    };
    const params: Map<string, any> = new Map();
    params.set('invoice', inviceModel);
    this.inventoryService.updateSaleInvoice(params).subscribe({
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

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.saleOrders.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.saleOrders.forEach((row) => {
          this.selection.select(row);
        });
  }
  showReturnPanel(ev: boolean) {
    this.isShowReturnPanel = ev;
    this.route.navigate(["/layout/sale/retun-sale-order",this.saleInvoice.id]);
  }

  printReport() {
    const printContents = this.PrintableReceiptComponent.nativeElement.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    // window.location.reload();
  }

}
