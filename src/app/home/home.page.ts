import { Component } from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';

interface MenuOption {
  title: string;
  icon: string;
  count?: number;
  route: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  public menuOptions: MenuOption[] = [
    {
      title: 'Criar usuários',
      icon: 'person-add-outline',
      route: '/criar-usuarios',
    },
    {
      title: 'Tickets abertos',
      icon: 'alert-circle-outline',
      count: 3,
      route: '/tickets/abertos',
    },
    {
      title: 'Tickets em andamento',
      icon: 'time-outline',
      count: 2,
      route: '/tickets/em-andamento',
    },
    {
      title: 'Tickets fechados',
      icon: 'checkmark-done-circle-outline',
      count: 4,
      route: '/tickets/fechados',
    },
  ];

  constructor() {}

  refresh(ev: any) {
    setTimeout(() => {
      (ev as RefresherCustomEvent).detail.complete();
    }, 3000);
  }
}
