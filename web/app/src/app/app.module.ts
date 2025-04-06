import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SaleComponent } from './modules/sale/sale.component';
import { AdminComponent } from './modules/admin/admin.component';
import { ManagerComponent } from './modules/manager/manager.component';
import { AuthComponent } from './modules/auth/auth.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PanelMenuModule } from 'primeng/panelmenu';
import { HttpClientModule } from '@angular/common/http';
import * as CanvasJSAngularChart from '../assets/canvas/canvasjs.angular.component';
import { CompsModule } from './modules/comps/comps.module';
import { AppLayoutModule } from './modules/layout/app.layout.module';
import { LayoutModule } from '@angular/cdk/layout';
var CanvasJSChart = CanvasJSAngularChart.CanvasJSChart;

@NgModule({
  declarations: [
    AppComponent,
    ManagerComponent,
    AuthComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PanelMenuModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CompsModule,
    AppLayoutModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
