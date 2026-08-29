import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

import { SupabaseService, TicketRecord, TicketStatus, UsuarioRecord, ComentarioRecord } from '../../supabase.service';
import { AuthService } from '../../auth.service';

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
  private authService = inject(AuthService);
  private alertCtrl = inject(AlertController);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  public ticket: TicketRecord | null = null;
  public comentarios: ComentarioRecord[] = [];
  public novoComentario = '';
  public isLoading = true;
  public isLoadingComentarios = false;
  public isSalvandoComentario = false;
  public statusSelecionado: TicketStatus = 'novo';

  public statusOptions: { value: TicketStatus; label: string }[] = [
    { value: 'novo', label: 'Novo' },
    { value: 'em-andamento', label: 'Em andamento' },
    { value: 'encaminhado-manutencao', label: 'Encaminhado para manutenção' },
    { value: 'concluido', label: 'Concluído' },
  ];

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
      this.statusSelecionado = (data?.status as TicketStatus) ?? 'novo';
      await this.loadComentarios(id);
    }
    this.isLoading = false;
  }

  async loadComentarios(ticketId: number) {
    this.isLoadingComentarios = true;
    const { data, error } = await this.supabaseService.getComments(ticketId);
    if (!error) {
      this.comentarios = (data as ComentarioRecord[]) ?? [];
    }
    this.isLoadingComentarios = false;
  }

  async alterarStatus(event: any) {
    const novoStatus = event.detail.value as TicketStatus;
    if (!this.ticket?.id || novoStatus === this.ticket.status) return;

    const loading = await this.showLoading('Atualizando status...');
    const { error } = await this.supabaseService.updateTicketStatus(this.ticket.id, novoStatus);

    if (!error && novoStatus === 'em-andamento') {
      const atendente = this.authService.getAtendente();
      if (atendente?.id) {
        await this.supabaseService.updateTicketAtendente(this.ticket.id, atendente.id);
        this.ticket = {
          ...this.ticket,
          atendente_id: atendente.id,
          atendente: { id: atendente.id, nome: atendente.nome },
        };
      }
    }

    loading.dismiss();

    if (error) {
      this.statusSelecionado = (this.ticket.status as TicketStatus) ?? 'novo';
      await this.showToast('Erro ao atualizar status.', 'danger');
    } else {
      this.ticket = { ...this.ticket, status: novoStatus };
      await this.showToast('Status atualizado com sucesso!', 'success');
    }
  }

  // ─── Comentar ───────────────────────────────────────────────────────────────

  async enviarComentario() {
    const texto = this.novoComentario.trim();
    if (!texto) {
      await this.showToast('O comentário não pode estar vazio.', 'warning');
      return;
    }

    const atendenteId = this.authService.getAtendente()?.id;
    if (!atendenteId || !this.ticket?.id) return;

    this.isSalvandoComentario = true;
    const { data, error } = await this.supabaseService.addComment(
      this.ticket.id,
      atendenteId,
      texto,
    );
    this.isSalvandoComentario = false;

    if (error) {
      console.error('Erro ao salvar comentário:', JSON.stringify(error));
      await this.showToast(`Erro: ${error?.message ?? 'desconhecido'}`, 'danger');
    } else {
      this.novoComentario = '';
      this.comentarios = [...this.comentarios, data as ComentarioRecord];
      await this.showToast('Comentário adicionado!', 'success');
    }
  }

  get jaEResponsavel(): boolean {
    const meuId = this.authService.getAtendente()?.id;
    return !!meuId && this.ticket?.atendente_id === meuId;
  }

  async assumirTicket() {
    const atendente = this.authService.getAtendente();
    if (!atendente?.id || !this.ticket?.id) return;

    const jaTemResponsavel = this.ticket.atendente_id != null;
    const nomeAtual = this.ticket.atendente?.nome;

    const mensagem = jaTemResponsavel
      ? `Este ticket está atribuído a ${nomeAtual ?? 'outro atendente'}. Deseja assumir a responsabilidade?`
      : 'Deseja assumir a responsabilidade por este ticket?';

    const alert = await this.alertCtrl.create({
      header: 'Assumir ticket',
      message: mensagem,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Assumir',
          handler: async () => {
            const loading = await this.showLoading('Assumindo ticket...');
            const { error } = await this.supabaseService.updateTicketAtendente(
              this.ticket!.id!,
              atendente.id!,
            );
            loading.dismiss();
            if (error) {
              await this.showToast('Erro ao assumir ticket.', 'danger');
            } else {
              this.ticket = {
                ...this.ticket!,
                atendente_id: atendente.id,
                atendente: { id: atendente.id, nome: atendente.nome },
              };
              await this.showToast('Ticket assumido com sucesso!', 'success');
            }
          },
        },
      ],
    });
    await alert.present();
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
    const { error } = await this.supabaseService.updateTicketStatus(this.ticket.id, 'concluido');
    loading.dismiss();
    if (error) {
      await this.showToast('Erro ao encerrar ticket.', 'danger');
    } else {
      this.ticket = { ...this.ticket, status: 'concluido' };
      this.statusSelecionado = 'concluido';
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
      message: `Como deseja contatar ${this.ticket?.nome_cadastrado_pelo_suporte ?? 'o cliente'}?`,
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
      'novo': 'Novo',
      'em-andamento': 'Em andamento',
      'encaminhado-manutencao': 'Encaminhado para manutenção',
      'concluido': 'Concluído'
    };
    return map[status ?? ''] ?? status ?? '-';
  }

  getStatusColor(status?: string): string {
    const map: Record<string, string> = {
      'novo': 'warning',
      'em-andamento': 'primary',
      'encaminhado-manutencao': 'tertiary',
      'concluido': 'success'
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
