import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddProductComponent } from './add-product/add-product.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/material.module';
import { MatIconModule } from '@angular/material/icon';
import { AddPersonComponent } from './add-person/add-person.component';
import { PageLoaderComponent } from './page-loader/page-loader.component';
import { AddCustomerComponent } from './add-customer/add-customer.component';
import { AddSupplyerComponent } from './add-supplyer/add-supplyer.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { PointOfSaleComponent } from './point-of-sale/point-of-sale.component';
import { AddTnxReasonComponent } from './add-tnx-reason/add-tnx-reason.component';
import { ProductCategoryComponent } from './product-category/product-category.component';
import { UnitTypeComponent } from './unit-type/unit-type.component';
import { AddPackagingCategoryComponent } from './add-packaging-category/add-packaging-category.component';
import { ExpenseComponent } from './expense/expense.component';
import { PayrollComponent } from './payroll/payroll.component';
import { DepositComponent } from './deposit/deposit.component';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { SalaryExpenseComponent } from './salary-expense/salary-expense.component';
import { VisualDashboardComponent } from './visual-dashboard/visual-dashboard.component';
import { CanvasJSChart } from './visual-dashboard/canvasjs.angular.component';
import { AddAssetsComponent } from './add-assets/add-assets.component';
import { AddLoanDetailsComponent } from './add-loan-details/add-loan-details.component';
import { AddBrandNameComponent } from './add-brand-name/add-brand-name.component';
import { ProfitReportComponent } from './profit-report/profit-report.component';
import { AddLoanAccComponent } from './add-loan-acc/add-loan-acc.component';
import { GlAccountsDetailsComponent } from './gl-accounts-details/gl-accounts-details.component';
import { AccountHistoryComponent } from './account-history/account-history.component';
import { CashWithdrawalComponent } from './cash-withdrawal/cash-withdrawal.component';
import { HeaderComponent } from './header/header.component';

const components = [AddProductComponent,AddPersonComponent,PageLoaderComponent,
  AddCustomerComponent,AddSupplyerComponent,MenuBarComponent,PointOfSaleComponent,
  AddTnxReasonComponent,ProductCategoryComponent,UnitTypeComponent,AddPackagingCategoryComponent,
  ExpenseComponent,PayrollComponent,DepositComponent,AddEmployeeComponent,SalaryExpenseComponent,VisualDashboardComponent,
  CanvasJSChart,AddAssetsComponent,AddLoanDetailsComponent,AddBrandNameComponent,ProfitReportComponent,AddLoanAccComponent,
  GlAccountsDetailsComponent,AccountHistoryComponent,CashWithdrawalComponent,HeaderComponent]


@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatIconModule,
    FormsModule
  ],
  exports: components
})
export class CompsModule { }
