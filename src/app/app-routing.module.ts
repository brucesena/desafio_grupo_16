import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule),
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'tickets',
    loadChildren: () => import('./tickets/tickets.module').then(m => m.TicketsPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'ticket-detail/:id',
    loadChildren: () => import('./tickets/ticket-detail/ticket-detail.module').then(m => m.TicketDetailPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'message/:id',
    loadChildren: () => import('./view-message/view-message.module').then(m => m.ViewMessagePageModule),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
