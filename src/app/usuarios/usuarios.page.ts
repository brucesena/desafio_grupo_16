import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-usuarios',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Criar usuários</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Novo usuário</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-label position="floating">Nome</ion-label>
            <ion-input [(ngModel)]="nome"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">E-mail</ion-label>
            <ion-input type="email" [(ngModel)]="email"></ion-input>
          </ion-item>
          <ion-button expand="block" class="ion-margin-top" (click)="salvarUsuario()">Salvar</ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class UsuariosPage {
  public nome = '';
  public email = '';

  constructor(private supabaseService: SupabaseService) {}

  async salvarUsuario() {
    if (!this.nome || !this.email) {
      console.warn('Preencha nome e e-mail antes de salvar.');
      return;
    }

    const { error } = await this.supabaseService.createUser({
      nome: this.nome,
      email: this.email,
    });

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return;
    }

    this.nome = '';
    this.email = '';
    console.log('Usuário criado com sucesso.');
  }
}
