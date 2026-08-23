import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

import { SupabaseService, TicketRecord, UsuarioRecord } from '../../supabase.service';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.page.html',
  styleUrls: ['./ticket-detail.page.scss'],
  standalone: false,
})
export class TicketDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private alertCtrl = inject(AlertController);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  public ticket: TicketRecord | null = null;
  public isLoading = true;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadTicket(id);
    }
  }

  async loadTicket(id: number) {
    this.isLoading = true;
    const { data, error } = await this.supabaseService.getTicketById(id);
    if (error) {
      console.error('Erro ao carregar ticket:', error);
      await this.showToast('Erro ao carregar ticket.', 'danger');
    } else {
      this.ticket = data;
    }
    this.isLoading = false;
  }

  // ─── Comentar ───────────────────────────────────────────────────────────────

  async abrirComentario() {
    const alert = await this.alertCtrl.create({
      header: 'Adicionar comentário',
      inputs: [
        {
          name: 'comentario',
          type: 'textarea',
          placeholder: 'Digite seu comentário...',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar',
          handler: async (data) => {
            const texto = data.comentario?.trim();
            if (!texto) {
              await this.showToast('O comentário não pode estar vazio.', 'warning');
              return false;
            }
            await this.salvarComentario(texto);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private async salvarComentario(texto: string) {
    if (!this.ticket?.id) return;
    const loading = await this.showLoading('Salvando comentário...');
    const { error } = await this.supabaseService.addComment(this.ticket.id, texto);
    loading.dismiss();
    if (error) {
      await this.showToast('Erro ao salvar comentário.', 'danger');
    } else {
      await this.showToast('Comentário adicionado com sucesso!', 'success');
    }
  }

  // ─── Encerrar ────────────────────────────────────────────────────────────────

  async confirmarEncerramento() {
    const alert = await this.alertCtrl.create({
      header: 'Encerrar ticket',
      message: 'Tem certeza que deseja encerrar este ticket?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Encerrar',
          cssClass: 'alert-button-danger',
          handler: () => this.encerrarTicket(),
        },
      ],
    });
    await alert.present();
  }

  private async encerrarTicket() {
    if (!this.ticket?.id) return;
    const loading = await this.showLoading('Encerrando ticket...');
    const { error } = await this.supabaseService.updateTicketStatus(this.ticket.id, 'fechado');
    loading.dismiss();
    if (error) {
      await this.showToast('Erro ao encerrar ticket.', 'danger');
    } else {
      this.ticket = { ...this.ticket, status: 'fechado' };
      await this.showToast('Ticket encerrado com sucesso!', 'success');
    }
  }

  // ─── Contatar usuário ────────────────────────────────────────────────────────

  async contatarUsuario() {
    const telefone = this.ticket?.telefone_cliente;
    if (!telefone) {
      await this.showToast('Este ticket não possui telefone de contato.', 'warning');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Contatar usuário',
      message: `Como deseja contatar ${this.ticket?.nome_cliente ?? 'o cliente'}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'WhatsApp',
          handler: () => {
            const numero = telefone.replace(/\D/g, '');
            window.open(`https://wa.me/55${numero}`, '_system');
          },
        },
        {
          text: 'Ligar',
          handler: () => {
            window.open(`tel:${telefone}`, '_system');
          },
        },
      ],
    });
    await alert.present();
  }

  // ─── Utilitários ─────────────────────────────────────────────────────────────

  getStatusLabel(status?: string): string {
    const map: Record<string, string> = {
      novo: 'novo',
      'em-andamento': 'Em andamento',
      fechado: 'Fechado',
    };
    return map[status ?? ''] ?? status ?? '-';
  }

  getStatusColor(status?: string): string {
    const map: Record<string, string> = {
      novo: 'warning',
      'em-andamento': 'primary',
      fechado: 'success',
    };
    return map[status ?? ''] ?? 'medium';
  }

  private async showLoading(message: string) {
    const loading = await this.loadingCtrl.create({ message, spinner: 'crescent' });
    await loading.present();
    return loading;
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}
