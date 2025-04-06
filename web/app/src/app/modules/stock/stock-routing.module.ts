import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductConfigComponent } from '../admin/product-config/product-config.component';
import { ProductManagementComponent } from '../admin/product-management/product-management.component';
import { AppAuthGuard } from '../app-auth.guard';
import { SupplyerComponent } from '../client/supplyer/supplyer.component';
import { AddStockComponent } from './add-stock/add-stock.component';
import { EditInvoiceComponent } from './edit-invoice/edit-invoice.component';
import { ReturnSupplyOrderComponent } from './return-supply-order/return-supply-order.component';
import { StockAuthGuard } from './stock-auth.guard';
import { StockComponent } from './stock.component';
import { SupplyInvoiceListComponent } from './supply-invoice-list/supply-invoice-list.component';

const routes: Routes = [{
  path: '', component: StockComponent,canActivate:[StockAuthGuard],
  children: [
      {path: '', component: AddStockComponent},
      {path: 'create-supply', component: AddStockComponent},
      {path: 'supply-invoice-list', component: SupplyInvoiceListComponent},
      {path: 'edit-supply-invoice/:id', component: EditInvoiceComponent},
      {path: 'product-stock', component: ProductManagementComponent},
      {path: 'product-detail/:id', component: ProductConfigComponent},
      {path: 'return-supply-order/:id', component: ReturnSupplyOrderComponent},
      {path: 'supplyer-list', component: SupplyerComponent},
      ]}
    ]

@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class StockRoutingModule { }
