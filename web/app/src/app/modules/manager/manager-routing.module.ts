import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientManagementComponent } from './client-management/client-management.component';
import { ManagerSalePointComponent } from './manager-sale-point/manager-sale-point.component';
import { ManagerComponent } from './manager.component';

const routes: Routes = [{
    path: '', component: ManagerComponent,
    children: [
        {path: '', component: ManagerSalePointComponent},
        {path: 'add-client', component: ClientManagementComponent},
      ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagerRoutingModule { }
