import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientComponent } from './client.component';
import { ClientRoutingModule } from './client-routing.module';
import { MaterialModule } from 'src/material.module';
import { CompsModule } from '../comps/comps.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ClientListComponent } from './client-list/client-list.component';
import { SupplyerComponent } from './supplyer/supplyer.component';
import { CustomerComponent } from './customer/customer.component';
import { ClientDetailsComponent } from './client-details/client-details.component';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { SupplyerDetailsComponent } from './supplyer-details/supplyer-details.component';



@NgModule({
  declarations: [
    ClientComponent,
    ClientListComponent,
    SupplyerComponent,
    CustomerComponent,
    ClientDetailsComponent,
    CustomerDetailsComponent,
    SupplyerDetailsComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    CommonModule,
    CompsModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    ClientRoutingModule
  ],
  
})
export class ClientModule { }
