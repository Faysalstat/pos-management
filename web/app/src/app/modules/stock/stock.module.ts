import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StockRoutingModule } from './stock-routing.module';
import { StockComponent } from './stock.component';
import { AddStockComponent } from './add-stock/add-stock.component';
import { MaterialModule } from 'src/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CompsModule } from '../comps/comps.module';
import { SupplyInvoiceListComponent } from './supply-invoice-list/supply-invoice-list.component';
import { EditInvoiceComponent } from './edit-invoice/edit-invoice.component';
import { ReturnSupplyOrderComponent } from './return-supply-order/return-supply-order.component';
@NgModule({
  declarations: [
    StockComponent,
    AddStockComponent,
    SupplyInvoiceListComponent,
    EditInvoiceComponent,
    ReturnSupplyOrderComponent
  ],
  imports: [
    CommonModule,
    StockRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CompsModule
  ]
})
export class StockModule { }
