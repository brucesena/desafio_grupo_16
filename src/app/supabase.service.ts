import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { environment } from '../environments/environment';

export type TicketStatus = 'em-aberto' | 'em-andamento' | 'fechado';

export interface TicketRecord {
  id?: number;
  created_at?: string;
  titulo?: string;
  categoria?: string;
  status?: TicketStatus;
  nome_cliente?: string;
  telefone_cliente?: string;
  atendente_id?: number | null;
}

export interface UsuarioRecord {
  id?: number;
  nome?: string;
  email?: string;
  criado_em?: string;
}

export interface AtendenteRecord {
  id?: number;
  nome?: string;
  email?: string;
  senha?: string;
  telefone?: string;
  criado_em?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  async login(email: string, senha: string): Promise<AtendenteRecord | null> {
    const { data, error } = await this.supabase
      .from('atendente')
      .select('*')
      .eq('email', email)
      .eq('senha', senha)
      .single();

    if (error || !data) {
      return null;
    }

    return data as AtendenteRecord;
  }

  getTickets(status?: TicketStatus) {
    if (status){
      return this.supabase.from('ticket').select('*').eq('status', status).order('created_at');
    }
    return this.supabase.from('ticket').select('*').order('created_at');
  }

  async getTicketCounts(): Promise<Record<string, number>> {
    const { data, error } = await this.supabase.from('ticket').select('status');

    if (error) {
      throw error;
    }

    const counts = {
      abertos: 0,
      emAndamento: 0,
      fechados: 0,
    };

    for (const ticket of data ?? []) {
      const status = ticket.status as TicketStatus;

      if (status === 'em-aberto') {
        counts.abertos += 1;
      } else if (status === 'em-andamento') {
        counts.emAndamento += 1;
      } else if (status === 'fechado') {
        counts.fechados += 1;
      }
    }

    return counts;
  }

  getTicketById(id: number) {
    return this.supabase.from('ticket').select('*').eq('id', id).single();
  }

  updateTicketStatus(id: number, status: TicketStatus) {
    return this.supabase.from('ticket').update({ status }).eq('id', id);
  }

  updateTicketAtendente(id: number, atendente_id: number) {
    return this.supabase.from('ticket').update({ atendente_id }).eq('id', id);
  }

  addComment(ticketId: number, comentario: string) {
    return this.supabase.from('comentarios').insert([{ ticket_id: ticketId, texto: comentario }]);
  }

  async cadastrarAtendente(atendente: Pick<AtendenteRecord, 'nome' | 'email' | 'senha' | 'telefone'>) {
    return this.supabase.from('atendente').insert([atendente]).select().single();
  }

  async emailAtendenteExiste(email: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('atendente')
      .select('id')
      .eq('email', email)
      .single();
    return !!data;
  }

  getUsers() {
    return this.supabase.from('usuarios').select('*');
  }

  createUser(user: Omit<UsuarioRecord, 'id' | 'criado_em'>) {
    return this.supabase.from('usuarios').insert([user]);
  }
}
