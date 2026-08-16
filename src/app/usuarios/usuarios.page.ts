import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

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
            <ion-input></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">E-mail</ion-label>
            <ion-input type="email"></ion-input>
          </ion-item>
          <ion-button expand="block" class="ion-margin-top">Salvar</ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule],
})
export class UsuariosPage {}
