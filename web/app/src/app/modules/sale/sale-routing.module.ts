import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppAuthGuard } from '../app-auth.guard';
import { CustomerComponent } from '../client/customer/customer.component';
import { EditSaleInvoiceComponent } from './edit-sale-invoice/edit-sale-invoice.component';
import { ReturnOrderComponent } from './return-order/return-order.component';
import { SaleInvoiceListComponent } from './sale-invoice-list/sale-invoice-list.component';
import { SalePointComponent } from './sale-point/sale-point.component';
import { SaleComponent } from './sale.component';

const routes: Routes = [{
    path: '', component: SaleComponent,canActivate:[AppAuthGuard],
    children: [
        {path: '', component: SalePointComponent},
        {path: 'sale-point', component: SalePointComponent},
        {path: 'sale-invoice-list', component: SaleInvoiceListComponent},
        {path: 'edit-sale-invoice/:id', component: EditSaleInvoiceComponent},
        {path: 'retun-sale-order/:id', component: ReturnOrderComponent},
        {path: 'customer-list', component: CustomerComponent},
        
        ]}
      ]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SaleRoutingModule { }
