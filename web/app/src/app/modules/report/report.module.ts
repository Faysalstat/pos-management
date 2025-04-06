import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { ReportComponent } from './report.component';
import { TreansactionReportComponent } from './treansaction-report/treansaction-report.component';
import { CompsModule } from '../comps/comps.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/material.module';
import { SalesReportComponent } from './sales-report/sales-report.component';
import { StockReportComponent } from './stock-report/stock-report.component';
import { SupplyReportComponent } from './supply-report/supply-report.component';
import { ProductReportComponent } from './product-report/product-report.component';
import { LoanReportComponent } from './loan-report/loan-report.component';
import { AccountHistoryReportComponent } from './account-history-report/account-history-report.component';
import { ExpenseReportComponent } from './expense-report/expense-report.component';
import { DrawingReportComponent } from './drawing-report/drawing-report.component';
import { StockSaleReportComponent } from './stock-sale-report/stock-sale-report.component';
import { StockSupplyReportComponent } from './stock-supply-report/stock-supply-report.component';


@NgModule({
  declarations: [
    ReportComponent,
    TreansactionReportComponent,
    SalesReportComponent,
    StockReportComponent,
    SupplyReportComponent,
    ProductReportComponent,
    LoanReportComponent,
    AccountHistoryReportComponent,
    ExpenseReportComponent,
    DrawingReportComponent,
    StockSaleReportComponent,
    StockSupplyReportComponent
  ],
  imports: [
    CommonModule,
    ReportRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CompsModule
  ]
})
export class ReportModule { }
