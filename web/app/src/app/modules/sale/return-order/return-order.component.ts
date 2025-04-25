import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderItem } from '../../model/models';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-return-order',
  templateUrl: './return-order.component.html',
  styleUrls: ['./return-order.component.css'],
})
export class ReturnOrderComponent implements OnInit {
  productForReduce: any[] = [];
  orderReturnCondition: any[] = [];
  saleInvoice!: any;
  selectedProduct!: any;
  selectedReturnItem: OrderItem = new OrderItem();
  selectedReturnCondition = 'RETURN';
  returnModel!: any;
  returnOrderList: any[] = [];
  prodMsg: string = '';
  totalAmount = 0;
  productToReturn: any;
  showLoader: boolean = false;
  constructor(
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private inventoryService: InventoryService,
    private notificationService: NotificationService
  ) {
    this.returnModel = {
      invoiceId: 0,
      orders: [],
      returnType: 'RETURN',
      cusAcc: 0,
      totalCostPrice: 0,
      totalSellPrice: 0,
      issuedBy: localStorage.getItem('username'),
    };
    this.orderReturnCondition = [
      { label: 'Select Return Condition', value: '' },
      { label: 'Cancel Order', value: 'CANCEL' },
      { label: 'Return', value: 'RETURN' },
      { label: 'Damaged', value: 'DAMAGED' },
    ];
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((parameter) => {
      let id = parameter['id'];
      this.fetchInvoiceDetailsByID(id);
    });
  }
  fetchInvoiceDetailsByID(id: any) {
    this.inventoryService.fetchSaleInvoiceById(id).subscribe({
      next: (res) => {
        this.saleInvoice = res.body;
        this.productForReduce = [];
        let orders = this.saleInvoice.orders;
        orders.map((elem: any) => {
          if (elem.state == 'SOLD' && elem.deliveryStatus == 'DELIVERED') {
            this.productForReduce.push(elem);
          }
        });
        if (this.productForReduce.length == 0) {
          this.prodMsg = '***No Delivered Product To Return';
        }
      },
      error: (err) => {
        this.notificationService.showMessage('ERROR', err.message, 'OK', 1000);
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

  addOrder() {
    this.returnOrderList.push(this.selectedReturnItem);
    this.returnModel.totalCostPrice += this.selectedReturnItem.totalOrderCost;
    this.returnModel.totalSellPrice += this.selectedReturnItem.totalOrderPrice;
    this.selectedReturnItem = new OrderItem();
    this.selectedProduct = {};
  }
   onSelectReturnOrder(event: any) {
    let selectedProduct = event.source.value.product;
    console.log(event.source.value);
    this.productToReturn = event.source.value;
    this.selectedReturnItem.id = event.source.value.id;
    this.selectedReturnItem.productId = selectedProduct.id;
    this.selectedReturnItem.productCode = selectedProduct.productCode;
    this.selectedReturnItem.productName = selectedProduct.productName;
    this.selectedReturnItem.unitType = selectedProduct.unitType;
    this.selectedReturnItem.packagingCategory =
      selectedProduct.packagingCategory;
    this.selectedReturnItem.unitPerPackage = selectedProduct.unitPerPackage;
    this.selectedReturnItem.pricePerUnit = selectedProduct.sellingPricePerUnit;
    this.selectedReturnItem.buyingPricePerUnit =
      selectedProduct.costPricePerUnit;
    this.selectedReturnItem.quantity = selectedProduct.quantity;
    // this.selectedReturnItem.quantityReturne
  }

  calculateQuantity() {
    this.selectedReturnItem.quantityReturned =
      this.selectedReturnItem.packageQuantity *
        this.selectedReturnItem.unitPerPackage +
      this.selectedReturnItem.looseQuantity;
    this.calculateOrder();
  }
  calculateOrder() {
    this.selectedReturnItem.totalOrderPrice =
      this.selectedReturnItem.quantityReturned *
      this.selectedReturnItem.pricePerUnit;
    this.selectedReturnItem.totalOrderCost =
      this.selectedReturnItem.quantityReturned *
      this.selectedReturnItem.buyingPricePerUnit;
  }
  receiveReturn() {
    this.showLoader = true;
    this.returnModel.invoiceId = this.saleInvoice.id;
    this.returnModel.orders = this.returnOrderList;
    this.returnModel.returnType = this.selectedReturnCondition;
    this.returnModel.cusAcc = this.saleInvoice.customer?.account?.id || 0;
    const params: Map<string, any> = new Map();
    params.set('return', this.returnModel);
    this.inventoryService.issueSaleOrderReturn(params).subscribe({
      next: (res) => {
        this.notificationService.showMessage(
          'SUCCESS',
          'Order Successfull Returned',
          'OK',
          500
        );
        this.route.navigate([
          '/layout/sale/edit-sale-invoice',
          this.saleInvoice.id,
        ]);
      },
      error: (err) => {
        this.showLoader = false;
        this.notificationService.showErrorMessage(
          'ERROR',
          'Order Returned Failed',
          'OK',
          500
        );
      },
      complete: () => {},
    });
  }

  canAddOrder(): boolean {
    return (
      !!this.selectedProduct &&
      (this.selectedReturnItem.looseQuantity || 0) > 0 &&
      !this.isStockInsufficient()
    );
  }

  // to check stock availability
  isStockInsufficient(): boolean {
    const existingQty =
      this.returnOrderList.find(
        (item) => item.productId === this.selectedReturnItem.productId
      )?.quantityReturned || 0;

    const availableToReturn =
      (this.productToReturn?.quantityDelivered || 0) -
      (this.productToReturn?.quantityReturned || 0);

    return (
      existingQty + this.selectedReturnItem.quantityReturned > 
      availableToReturn
    );
  }
}
