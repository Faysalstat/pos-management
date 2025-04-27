import { Component, HostListener, OnInit } from '@angular/core';
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
  isSubmitting: boolean = false;
  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    // 1. Prevent default form submission behavior
    event.preventDefault();

    // 2. Check if button would be enabled
    if (this.canAddOrder()) {
      // 3. Execute the add order action
      this.addOrder();
    }
  }
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

  // addOrder() {
  //   this.returnOrderList.push(this.selectedReturnItem);
  //   this.returnModel.totalCostPrice += this.selectedReturnItem.totalOrderCost;
  //   this.returnModel.totalSellPrice += this.selectedReturnItem.totalOrderPrice;
  //   this.selectedReturnItem = new OrderItem();
  //   this.selectedProduct = {};
  // }
  addOrder() {
    if (!this.canAddOrder()) return;

    // Validate required fields
    if (
      !this.selectedReturnItem.productId ||
      !this.selectedReturnItem.quantityReturned ||
      !this.selectedReturnItem.pricePerUnit
    ) {
      return;
    }

    // Calculate available quantity
    const available =
      (this.productToReturn?.quantityDelivered || 0) -
      (this.productToReturn?.quantityReturned || 0);

    // Check for existing product in returnOrderList
    const existingItemIndex = this.returnOrderList.findIndex(
      (item) => item.productId === this.selectedReturnItem.productId
    );

    if (existingItemIndex > -1) {
      // Calculate total requested return quantity
      const totalRequested =
        this.returnOrderList[existingItemIndex].quantityReturned +
        this.selectedReturnItem.quantityReturned;

      // Validate available quantity
      if (totalRequested > available) {
        const remaining =
          available - this.returnOrderList[existingItemIndex].quantityReturned;
        this.notificationService.showErrorMessage(
          'Return Quantity Exceeded',
          `You can only return ${remaining} more units of ${this.selectedReturnItem.productName}`,
          'OK',
          3000
        );
        return;
      }

      // Update existing item
      const existingItem = this.returnOrderList[existingItemIndex];
      existingItem.quantityReturned = totalRequested;
      existingItem.totalOrderPrice =
        existingItem.quantityReturned * existingItem.pricePerUnit;
      existingItem.totalOrderCost =
        existingItem.quantityReturned * existingItem.buyingPricePerUnit;

      // Update receipt model totals
      this.returnModel.totalCostPrice = this.returnOrderList.reduce(
        (sum, item) => sum + item.totalOrderCost,
        0
      );
      this.returnModel.totalSellPrice = this.returnOrderList.reduce(
        (sum, item) => sum + item.totalOrderPrice,
        0
      );
    } else {
      // Validate available quantity for new item
      if (this.selectedReturnItem.quantityReturned > available) {
        this.notificationService.showErrorMessage(
          'Return Quantity Exceeded',
          `Only ${available} units available for ${this.selectedReturnItem.productName}`,
          'OK',
          3000
        );
        return;
      }

      // Add new item
      this.returnOrderList.push({ ...this.selectedReturnItem });
      this.returnModel.totalCostPrice += this.selectedReturnItem.totalOrderCost;
      this.returnModel.totalSellPrice +=
        this.selectedReturnItem.totalOrderPrice;
    }

    // Reset for next item
    this.selectedReturnItem = new OrderItem();
    this.selectedProduct = null;
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
    this.selectedReturnItem.looseQuantity = 0;
  }

  // calculateQuantity() {
  //   this.selectedReturnItem.quantityReturned =
  //     this.selectedReturnItem.packageQuantity *
  //       this.selectedReturnItem.unitPerPackage +
  //     this.selectedReturnItem.looseQuantity;
  //   this.calculateOrder();
  // }

  calculateQuantity() {
    if (!this.selectedProduct) return;

    // Ensure quantity is not negative
    if (this.selectedReturnItem.looseQuantity < 0) {
      this.selectedReturnItem.looseQuantity = 0;
    }

    const available =
      (this.productToReturn?.quantityDelivered || 0) -
      (this.productToReturn?.quantityReturned || 0);

    // Calculate total requested quantity (including existing in returnOrderList)
    const existingQty =
      this.returnOrderList.find(
        (item) => item.productId === this.selectedReturnItem.productId
      )?.quantityReturned || 0;

    const totalRequested =
      existingQty +
      this.selectedReturnItem.packageQuantity *
        this.selectedReturnItem.unitPerPackage +
      this.selectedReturnItem.looseQuantity;

    // Ensure quantity doesn't exceed available
    if (totalRequested > available) {
      const remaining = available - existingQty;
      //this.selectedReturnItem.looseQuantity = Math.max(0, remaining);
      this.notificationService.showMessage(
        'WARNING',
        `Only ${remaining} units can be returned`,
        'OK',
        2000
      );
    }

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
    if (this.isSubmitting) return; // Prevent multiple clicks
    this.isSubmitting = true; // Disable the button
    this.showLoader = true;
    this.returnModel.invoiceId = this.saleInvoice.id;
    this.returnModel.isWalkingCustomer = this.saleInvoice.isWalkingCustomer;
    this.returnModel.orders = this.returnOrderList;
    this.returnModel.returnType = this.selectedReturnCondition;
   
    this.returnModel.cusAcc = this.saleInvoice.isWalkingCustomer
      ? 0
      : this.saleInvoice.customer?.account?.id;

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
        this.isSubmitting = false; // Re-enable if API fails
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

  // canAddOrder(): boolean {
  //   return (
  //     !!this.selectedProduct &&
  //     (this.selectedReturnItem.looseQuantity || 0) > 0 &&
  //     !this.isStockInsufficient()
  //   );
  // }
  canAddOrder(): boolean {
    if (!this.selectedProduct || !this.selectedReturnItem.quantityReturned) {
      return false;
    }

    const existingQty =
      this.returnOrderList.find(
        (item) => item.productId === this.selectedReturnItem.productId
      )?.quantityReturned || 0;

    const available =
      (this.productToReturn?.quantityDelivered || 0) -
      (this.productToReturn?.quantityReturned || 0);

    return existingQty + this.selectedReturnItem.quantityReturned <= available;
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
      existingQty + this.selectedReturnItem.quantityReturned > availableToReturn
    );
  }
}
