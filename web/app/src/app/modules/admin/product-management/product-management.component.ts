import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification-service.service';
import { ProductService } from '../../services/product-service.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css'],
})
export class ProductManagementComponent implements OnInit {
  offset: number = 0;
  limit = 5;
  // total number of products for paginator - initialize to 0 and update from server
  length = 0;
  pageSize = 10;
  // allow up to 10000 page size
  pageSizeOptions: number[] = [5, 10, 25, 100, 500, 1000, 5000, 10000];
  productList!: any[];
  categories: any[] = [];
  brandName: string = '';
  productName: string = '';
  categoryName: string = '';
  code: string = '';
  showLoader = false;
  productNames: any[] = [];
  filteredProductNames: string[] = [];
  searchInput$ = new Subject<string>();

  constructor(
    private productService: ProductService,
    private notificationService: NotificationService,
    private route: Router
  ) {}

  ngOnInit(): void {
    this.fetchProductCategory();
    this.fetchProductNames();
    this.fetchAllProducts();

    // Setup debounce for product name search
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.filterProductNames(searchTerm);
      });
  }

  // onProductNameInput(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   this.searchInput$.next(input.value.trim().toLowerCase());
  // }

  //   filterProductNames(searchTerm: string): void {
  //   if (!searchTerm) {
  //     this.filteredProductNames = [...this.productNames];
  //     return;
  //   }
  //   this.filteredProductNames = this.productNames.filter(name =>
  //     name.toLowerCase().includes(searchTerm)
  //   );
  // }

  onProductNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const inputValue = input?.value?.trim()?.toLowerCase() || '';
    this.searchInput$.next(inputValue);
  }

  filterProductNames(searchTerm: string): void {
    // Handle null, undefined, or empty search term
    if (!searchTerm) {
      this.filteredProductNames = [...(this.productNames || [])];
      return;
    }

    // Ensure productNames exists and is an array
    const safeProductNames = this.productNames || [];

    this.filteredProductNames = safeProductNames.filter(
      (name) => name?.toLowerCase()?.includes(searchTerm) || false
    );
  }
  onProductSelected(selectedName: string): void {
    this.productName = selectedName;
    this.fetchAllProducts(); // Trigger product list refresh
  }

  fetchProductCategory() {
    this.categories = [{ label: 'Select Category', value: '' }];
    this.productService.fetchAllProductCategory().subscribe({
      next: (res) => {
        if (res.body) {
          let categoryList = res.body;
          categoryList.map((elem: any) => {
            let option = { label: elem.key, value: elem.value };
            this.categories.push(option);
          });
        } else {
          this.notificationService.showErrorMessage(
            'ERROR',
            'No Product Category Found',
            'OK',
            500
          );
        }
      },
    });
  }

  fetchProductNames(): void {
    this.productService.fetchAllProductNames().subscribe({
      next: (res) => {
        if (Array.isArray(res.body)) {
          this.productNames = res.body;
          this.filteredProductNames = [...res.body]; // Initialize filtered list
        } else {
          this.productNames = [];
          this.filteredProductNames = [];
          this.notificationService.showErrorMessage(
            'ERROR',
            'Product names response is not an array',
            'OK',
            500
          );
        }
      },
      error: (err) => {
        this.notificationService.showErrorMessage(
          'ERROR',
          'Failed to load product names',
          'OK',
          500
        );
      },
    });
  }

  fetchAllProducts() {
    const params: Map<string, any> = new Map();
    params.set('offset', this.offset);
    params.set('limit', this.pageSize);
    params.set('brandName', this.brandName);
    params.set('productName', this.productName);
    params.set('categoryName', this.categoryName);
    params.set('code', this.code);
    this.productService.fetchAllProduct(params).subscribe({
      next: (res: any) => {
        if (!res) return;

        // Try header first
        const headerTotal = res.headers?.get?.('X-Total-Count') || res.headers?.get?.('x-total-count');
        if (headerTotal) {
          this.length = parseInt(headerTotal, 10) || 0;
        }

        const body = res.body ?? res;

        // If backend returned { items: [...], total: N }
        if (body && body.items && Array.isArray(body.items)) {
          this.productList = body.items;
          if (body.total !== undefined && (!headerTotal)) {
            this.length = parseInt(body.total, 10) || this.offset + this.productList.length;
          }
          return;
        }

        // If backend returned an array directly
        if (Array.isArray(body)) {
          this.productList = body;
          // fallback total = offset + returned items
          this.length = this.offset + this.productList.length;
          return;
        }

        // Fallback: try to use body.body if double-wrapped
        if (body && body.body && Array.isArray(body.body)) {
          this.productList = body.body;
          this.length = body.total ?? (this.offset + this.productList.length);
          return;
        }

        // default empty
        this.productList = [];
        this.length = this.length || 0;
      },
    });
  }

  pageChange(event: any) {
    this.pageSize = event.pageSize;
    this.offset = this.pageSize * event.pageIndex;
    this.fetchAllProducts();
  }
  onselectProduct(product: any) {
    this.route.navigate(['/layout/supply/product-detail', product.id]);
  }
  packProduct(product: any) {
    let packQnt = '';
    let availableQuantity = product.quantity - product.quantitySold;
    if (product.unitPerPackage && product.packagingCategory) {
      packQnt =
        Math.floor(availableQuantity / product.unitPerPackage) +
        ' ' +
        product.packagingCategory +
        ' ' +
        (product.quantity % product.unitPerPackage) +
        ' ' +
        product.unitType;
    } else {
      packQnt = 'N/A';
    }
    return packQnt;
  }
  refreshFilter() {
    this.brandName = '';
    this.productName = '';
    this.categoryName = '';
    this.code = '';
    this.fetchAllProducts();
  }
}
