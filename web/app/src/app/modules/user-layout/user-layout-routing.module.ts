import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserLayoutComponent } from './user-layout.component';
import { AppAuthGuard } from '../app-auth.guard';
const routes: Routes = [
  {
    path: '',
    canActivate: [AppAuthGuard],
    component: UserLayoutComponent,
    children: [
      {
        path: 'sale',
        loadChildren: () =>
          import('../sale/sale.module').then((m) => m.SaleModule),
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('../admin/admin.module').then((m) => m.AdminModule),
      },
      {
        path: 'supply',
        loadChildren: () =>
          import('../stock/stock.module').then((m) => m.StockModule),
      },
      {
        path: 'client',
        loadChildren: () =>
          import('../client/client.module').then((m) => m.ClientModule),
      },
      {
        path: 'cash',
        loadChildren: () =>
          import('../cash/cash.module').then((m) => m.CashModule),
      },
      {
        path: 'manager',
        loadChildren: () =>
          import('../manager/manager.module').then((m) => m.ManagerModule),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('../report/report.module').then((m) => m.ReportModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
