import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppAuthGuard } from '../app-auth.guard';
import { CashAuthGuard } from './cash-auth.guard';
import { CashTransactionComponent } from './cash-transaction/cash-transaction.component';
import { CashComponent } from './cash.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { LoanDetailsComponent } from './loan-details/loan-details.component';
import { LoanListComponent } from './loan-list/loan-list.component';
import { TransactionListComponent } from './transaction-list/transaction-list.component';

const routes: Routes = [{
    path: '', component: CashComponent,canActivate:[CashAuthGuard],
    children: [
        {path: '', component: CashTransactionComponent},
        {path: 'cash-transaction', component: CashTransactionComponent},
        {path: 'expenses', component: ExpensesComponent},
        {path: 'transaction-list', component: TransactionListComponent},
        {path: 'loan-list', component: LoanListComponent},
        {path: 'loan-details/:id', component: LoanDetailsComponent},
        ]}
      ]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CashRoutingModule { }
