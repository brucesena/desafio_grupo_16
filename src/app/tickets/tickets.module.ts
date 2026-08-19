import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { TicketsPage } from './tickets.page';
import { TicketsPageRoutingModule } from './tickets-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    TicketsPageRoutingModule,
  ],
  declarations: [TicketsPage],
})
export class TicketsPageModule {}
