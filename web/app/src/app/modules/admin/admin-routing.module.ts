import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddAssetsComponent } from '../comps/add-assets/add-assets.component';
import { AddLoanAccComponent } from '../comps/add-loan-acc/add-loan-acc.component';
import { AddEmployeePanelComponent } from './add-employee-panel/add-employee-panel.component';
import { AddUserComponent } from './add-user/add-user.component';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminComponent } from './admin.component';
import { ApprovalDetailsComponent } from './approval-details/approval-details.component';
import { AssetsManagementComponent } from './assets-management/assets-management.component';
import { CashApprovalDetailsComponent } from './cash-approval-details/cash-approval-details.component';
import { ConfigurationSettingComponent } from './configuration-setting/configuration-setting.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { EmployeeManagementComponent } from './employee-management/employee-management.component';
import { LoanApprovalDetailsComponent } from './loan-approval-details/loan-approval-details.component';
import { ProductConfigComponent } from './product-config/product-config.component';
import { ProductManagementComponent } from './product-management/product-management.component';
import { ProfitCalculationComponent } from './profit-calculation/profit-calculation.component';
import { TaskListComponent } from './task-list/task-list.component';

const routes: Routes = [{
    path: '', component: AdminComponent,canActivate:[AdminAuthGuard],
    children: [
        {path: '', component: DashboardComponent},
        {path: 'dashboard', component: DashboardComponent},
        {path: 'assets', component: AssetsManagementComponent},
        {path: 'add-product', component: ProductConfigComponent},
        {path: 'add-config', component: ConfigurationSettingComponent},
        {path: 'add-asset', component: AddAssetsComponent},
        {path: 'add-user', component: AddUserComponent},
        {path: 'add-loan-client', component: AddLoanAccComponent},
        {path: 'add-employee', component: AddEmployeePanelComponent},
        {path: 'employee-list', component: EmployeeManagementComponent},
        {path: 'task-list', component: TaskListComponent},
        {path: 'product-stock', component: ProductManagementComponent},
        {path: 'product-detail/:id', component: ProductConfigComponent},
        {path: 'task-details/:id', component: ApprovalDetailsComponent},
        {path: 'tnx-task-details/:id', component: CashApprovalDetailsComponent},
        {path: 'loan-task-details/:id', component: LoanApprovalDetailsComponent},
        {path: 'employee-details/:id', component: EmployeeDetailsComponent},
        {path: 'profit-calculation', component: ProfitCalculationComponent},
      ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
