import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RefresherCustomEvent, AlertController } from '@ionic/angular';
import { inject } from '@angular/core';

import { SupabaseService } from '../supabase.service';
import { AuthService } from '../auth.service';

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
export class HomePage implements OnInit {
  private supabaseService = inject(SupabaseService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);

  get nomeAtendente(): string {
    return this.authService.getAtendente()?.nome ?? 'Atendente';
  }

  public menuOptions: MenuOption[] = [
    {
      title: 'Todos os tickets',
      icon: 'list-outline',
      count: 0,
      route: '/tickets/todos',
    },
    {
      title: 'Tickets abertos',
      icon: 'alert-circle-outline',
      count: 0,
      route: '/tickets/abertos',
    },
    {
      title: 'Tickets em andamento',
      icon: 'time-outline',
      count: 0,
      route: '/tickets/em-andamento',
    },
    {
      title: 'Tickets fechados',
      icon: 'checkmark-done-circle-outline',
      count: 0,
      route: '/tickets/fechados',
    },
  ];

  ngOnInit() {
    this.loadTicketCounts();
  }

  async loadTicketCounts() {
    try {
      const counts = await this.supabaseService.getTicketCounts();

      this.menuOptions = this.menuOptions.map(option => {
        if (option.title === 'Todos os tickets') {
          const total = (counts['abertos'] ?? 0) + (counts['emAndamento'] ?? 0) + (counts['fechados'] ?? 0);
          return { ...option, count: total };
        }

        if (option.title === 'Tickets abertos') {
          return { ...option, count: counts['abertos'] };
        }

        if (option.title === 'Tickets em andamento') {
          return { ...option, count: counts['emAndamento'] };
        }

        if (option.title === 'Tickets fechados') {
          return { ...option, count: counts['fechados'] };
        }

        return option;
      });
    } catch (error) {
      console.error('Erro ao carregar contagem de tickets:', error);
    }
  }

  refresh(ev: any) {
    setTimeout(() => {
      (ev as RefresherCustomEvent).detail.complete();
      this.loadTicketCounts();
    }, 3000);
  }

  async confirmarLogout() {
    const alert = await this.alertCtrl.create({
      header: 'Sair',
      message: 'Deseja encerrar a sessão?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sair',
          cssClass: 'alert-button-danger',
          handler: () => {
            this.authService.encerrarSessao();
            this.router.navigateByUrl('/login', { replaceUrl: true });
          },
        },
      ],
    });
    await alert.present();
  }
}
