import { Injectable } from '@angular/core';
import { AtendenteRecord } from './supabase.service';

const SESSION_KEY = 'atendente_session';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private atendente: AtendenteRecord | null = null;

  constructor() {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        this.atendente = JSON.parse(stored) as AtendenteRecord;
      } catch {
        this.atendente = null;
      }
    }
  }

  salvarSessao(atendente: AtendenteRecord) {
    // Não persiste a senha no storage
    const { senha, ...semSenha } = atendente;
    this.atendente = semSenha;
    localStorage.setItem(SESSION_KEY, JSON.stringify(semSenha));
  }

  encerrarSessao() {
    this.atendente = null;
    localStorage.removeItem(SESSION_KEY);
  }

  getAtendente(): AtendenteRecord | null {
    return this.atendente;
  }

  isLogado(): boolean {
    return this.atendente !== null;
  }
}
