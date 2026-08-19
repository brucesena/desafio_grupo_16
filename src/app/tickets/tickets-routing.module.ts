import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TicketsPage } from './tickets.page';

const routes: Routes = [
  {
    path: ':status',
    component: TicketsPage,
  },
  {
    path: 'ticket-detail',
    loadChildren: () => import('./ticket-detail/ticket-detail.module').then( m => m.TicketDetailPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TicketsPageRoutingModule {}
