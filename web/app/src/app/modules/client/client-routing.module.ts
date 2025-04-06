import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppAuthGuard } from '../app-auth.guard';
import { CashAuthGuard } from '../cash/cash-auth.guard';
import { AddCustomerComponent } from '../comps/add-customer/add-customer.component';
import { AddSupplyerComponent } from '../comps/add-supplyer/add-supplyer.component';
import { ClientAuthGuard } from './client-auth.guard';
import { ClientDetailsComponent } from './client-details/client-details.component';
import { ClientListComponent } from './client-list/client-list.component';
import { ClientComponent } from './client.component';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { CustomerComponent } from './customer/customer.component';
import { SupplyerDetailsComponent } from './supplyer-details/supplyer-details.component';
import { SupplyerComponent } from './supplyer/supplyer.component';

const routes: Routes = [{
    path: '', component: ClientComponent,canActivate:[ClientAuthGuard],
    children: [
        {path: '', component: CustomerComponent},
        {path: 'customer-list', component: CustomerComponent},
        {path: 'supplyer-list', component: SupplyerComponent},
        {path: 'add-supplyer', component: AddSupplyerComponent},
        {path: 'add-customer', component: AddCustomerComponent},
        {path: 'client-details/:id', component: ClientDetailsComponent},
        {path: 'supplyer-details/:id', component: SupplyerDetailsComponent},
        {path: 'customer-details/:id', component: CustomerDetailsComponent},
        ]}
      ]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
