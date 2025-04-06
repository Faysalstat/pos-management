import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppAuthGuard } from '../app-auth.guard';
import { ProfitReportComponent } from '../comps/profit-report/profit-report.component';
import { AccountHistoryReportComponent } from './account-history-report/account-history-report.component';
import { LoanReportComponent } from './loan-report/loan-report.component';
import { ReportAuthGuard } from './report-auth.guard';
import { ReportComponent } from './report.component';
import { SalesReportComponent } from './sales-report/sales-report.component';
import { StockReportComponent } from './stock-report/stock-report.component';
import { SupplyReportComponent } from './supply-report/supply-report.component';
import { TreansactionReportComponent } from './treansaction-report/treansaction-report.component';
import { ExpenseReportComponent } from './expense-report/expense-report.component';
import { DrawingReportComponent } from './drawing-report/drawing-report.component';
import { StockSaleReportComponent } from './stock-sale-report/stock-sale-report.component';
import { StockSupplyReportComponent } from './stock-supply-report/stock-supply-report.component';

const routes: Routes = [{
  path: '', component: ReportComponent,canActivate:[ReportAuthGuard],
  children: [
      {path: '', component: TreansactionReportComponent},
      {path: 'transaction-report', component: TreansactionReportComponent},
      {path: 'loan-report', component: LoanReportComponent},
      {path: 'sales-report', component: SalesReportComponent},
      {path: 'stock-report', component: StockReportComponent},
      {path: 'stock-sale-report', component: StockSaleReportComponent},
      {path: 'stock-supply-report', component: StockSupplyReportComponent},
      {path: 'profit-report', component: ProfitReportComponent},
      {path: 'expense-report', component: ExpenseReportComponent},
      {path: 'drawing-report', component: DrawingReportComponent},
      {path: 'account-history-report', component: AccountHistoryReportComponent},
      ]}
    ]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
