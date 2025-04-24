import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderItem } from '../../model/models';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-return-supply-order',
  templateUrl: './return-supply-order.component.html',
  styleUrls: ['./return-supply-order.component.css'],
})
export class ReturnSupplyOrderComponent implements OnInit {
  productForReduce: any[] = [];
  orderReturnCondition: any[] = [];
  supplyInvoice: any;
  selectedselectedReturnItem: any;
  selectedProduct: any;
  selectedReturnItem: OrderItem = new OrderItem();
  selectedReturnCondition = 'RETURN';
  returnModel: any;
  returnOrderList: any[] = [];
  prodMsg: string = '';
  isSubmitting: boolean = false;
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
      suppAcc: 0,
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
    this.inventoryService.fetchSupplyInvoiceById(id).subscribe({
      next: (res) => {
        this.supplyInvoice = res.body;
        this.productForReduce = [];
        let orders = this.supplyInvoice.supplyOrders;
        orders.map((elem: any) => {
          if (elem.state == 'PURCHASED' && elem.deliveryStatus == 'DELIVERED') {
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
    // this.returnModel.totalCostPrice += this.selectedReturnItem.totalOrderCost;
    this.returnModel.totalSellPrice += this.selectedReturnItem.totalOrderPrice;
    this.selectedReturnItem = new OrderItem();
    this.selectedProduct = {};
  }
  onSelectReturnOrder(event: any) {
    let selectedProduct = event.source.value.product;
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
      this.selectedReturnItem.buyingPricePerUnit;
  }
  receiveReturn() {
    if (this.isSubmitting) return; // Prevent multiple clicks
    this.isSubmitting = true; // Disable the button

    this.returnModel.invoiceId = this.supplyInvoice.id;
    this.returnModel.orders = this.returnOrderList;
    this.returnModel.returnType = this.selectedReturnCondition;
    this.returnModel.suppAcc = this.supplyInvoice.supplyer.account.id;
    const params: Map<string, any> = new Map();
    params.set('return', this.returnModel);
    this.inventoryService.issueSupplyOrderReturn(params).subscribe({
      next: (res) => {
        this.notificationService.showMessage(
          'SUCCESS',
          'Order Successfully Returned',
          'OK',
          500
        );
        this.route.navigate([
          '/layout/supply/edit-supply-invoice',
          this.supplyInvoice.id,
        ]);
      },
      error: (err) => {
        this.notificationService.showErrorMessage(
          'ERROR',
          'Order Returned Failed',
          'OK',
          200
        );
        this.isSubmitting = false; // Re-enable on error
      },
    });
  }
  canAddProduct(): boolean {
    return (
      !!this.selectedProduct &&
      !!this.selectedReturnCondition &&
      (this.selectedReturnItem?.quantityReturned || 0) > 0
    );
  }
}
