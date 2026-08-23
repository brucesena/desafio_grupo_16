import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

import { SupabaseService } from '../supabase.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  private supabaseService = inject(SupabaseService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  public email = '';
  public senha = '';
  public senhaVisivel = false;
  public tentouEnviar = false;

  get emailInvalido(): boolean {
    return this.tentouEnviar && !this.email.trim();
  }

  get senhaInvalida(): boolean {
    return this.tentouEnviar && !this.senha.trim();
  }

  toggleSenha() {
    this.senhaVisivel = !this.senhaVisivel;
  }

  async entrar() {
    this.tentouEnviar = true;

    if (!this.email.trim() || !this.senha.trim()) {
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Entrando...',
      spinner: 'crescent',
    });
    await loading.present();

    const atendente = await this.supabaseService.login(
      this.email.trim().toLowerCase(),
      this.senha,
    );

    await loading.dismiss();

    if (!atendente) {
      await this.showToast('E-mail ou senha incorretos.', 'danger');
      return;
    }

    this.authService.salvarSessao(atendente);
    await this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  // ─── Cadastro ────────────────────────────────────────────────────────────────

  async abrirCadastro() {
    const alert = await this.alertCtrl.create({
      header: 'Criar conta',
      inputs: [
        {
          name: 'nome',
          type: 'text',
          placeholder: 'Nome completo',
          attributes: { autocomplete: 'name' },
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'E-mail',
          attributes: { autocomplete: 'email' },
        },
        {
          name: 'telefone',
          type: 'tel',
          placeholder: 'Telefone (ex: 11999998888)',
          attributes: { autocomplete: 'tel' },
        },
        {
          name: 'senha',
          type: 'password',
          placeholder: 'Senha',
          attributes: { autocomplete: 'new-password' },
        },
        {
          name: 'confirmarSenha',
          type: 'password',
          placeholder: 'Confirmar senha',
          attributes: { autocomplete: 'new-password' },
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cadastrar',
          handler: (dados) => {
            // Retorna false para manter o alert novo em caso de erro
            return this.processarCadastro(dados);
          },
        },
      ],
    });
    await alert.present();
  }

  private async processarCadastro(dados: {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    confirmarSenha: string;
  }): Promise<boolean> {
    const nome = dados.nome?.trim();
    const email = dados.email?.trim().toLowerCase();
    const telefone = dados.telefone?.trim();
    const senha = dados.senha;
    const confirmarSenha = dados.confirmarSenha;

    if (!nome || !email || !senha) {
      await this.showToast('Preencha todos os campos obrigatórios.', 'warning');
      return false;
    }

    if (senha !== confirmarSenha) {
      await this.showToast('As senhas não coincidem.', 'warning');
      return false;
    }

    if (senha.length < 6) {
      await this.showToast('A senha deve ter no mínimo 6 caracteres.', 'warning');
      return false;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Criando conta...',
      spinner: 'crescent',
    });
    await loading.present();

    const emailJaExiste = await this.supabaseService.emailAtendenteExiste(email);

    if (emailJaExiste) {
      await loading.dismiss();
      await this.showToast('Este e-mail já está cadastrado.', 'warning');
      return false;
    }

    const { data, error } = await this.supabaseService.cadastrarAtendente({ nome, email, senha, telefone });
    await loading.dismiss();

    if (error || !data) {
      console.error('Erro ao cadastrar atendente:', JSON.stringify(error));
      await this.showToast(`Erro: ${error?.message ?? 'desconhecido'}`, 'danger');
      return false;
    }

    await this.showToast(`Conta criada com sucesso! Bem-vindo, ${nome}.`, 'success');

    // Loga automaticamente após o cadastro
    this.authService.salvarSessao(data);
    await this.router.navigateByUrl('/home', { replaceUrl: true });
    return true;
  }

  // ─── Utilitário ──────────────────────────────────────────────────────────────

  private async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}
