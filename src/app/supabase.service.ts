import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { environment } from '../environments/environment';

export type TicketStatus = 'novo' | 'em-andamento' | 'encaminhado-manutencao' | 'concluido';

export interface TicketRecord {
  id?: number;
  created_at?: string;
  titulo?: string;
  categoria?: string;
  status?: TicketStatus;
  nome_cadastrado_pelo_suporte?: string;
  telefone_cliente?: string;
  atendente_id?: number | null;
  atendente?: { id?: number; nome?: string };
  marca_equipamento?: string;
  modelo_equipamento?: string;
  equipamento_novo_ou_antigo?: string;
  descricao_problema?: string;
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

export interface ComentarioRecord {
  id?: number;
  created_at?: string;
  ticket_id?: number;
  atendente_id?: number;
  comentario?: string;
  atendente?: { nome?: string };
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
    if (status) {
      return this.supabase.from('ticket').select('*, atendente(id, nome)').eq('status', status).order('created_at');
    }
    return this.supabase.from('ticket').select('*, atendente(id, nome)').order('created_at');
  }

  async getTicketCounts(): Promise<Record<string, number>> {
    const { data, error } = await this.supabase.from('ticket').select('status');

    if (error) {
      throw error;
    }

    const counts = {
      novos: 0,
      emAndamento: 0,
      fechados: 0,
    };

    for (const ticket of data ?? []) {
      const status = ticket.status as TicketStatus;

      if (status === 'novo') {
        counts.novos += 1;
      } else if (status === 'em-andamento') {
        counts.emAndamento += 1;
      } else if (status === 'concluido') {
        counts.fechados += 1;
      }
    }

    return counts;
  }

  getTicketById(id: number) {
    return this.supabase
      .from('ticket')
      .select('*, atendente(id, nome)')
      .eq('id', id)
      .single();
  }

  updateTicketStatus(id: number, status: TicketStatus) {
    return this.supabase.from('ticket').update({ status }).eq('id', id);
  }

  updateTicketAtendente(id: number, atendente_id: number) {
    return this.supabase.from('ticket').update({ atendente_id }).eq('id', id);
  }

  addComment(ticketId: number, atendenteId: number, texto: string) {
    return this.supabase
      .from('comentario')
      .insert([{ ticket_id: ticketId, atendente_id: atendenteId, comentario: texto }])
      .select('*, atendente(nome)')
      .single();
  }

  getComments(ticketId: number) {
    return this.supabase
      .from('comentario')
      .select('*, atendente(nome)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
  }

  async cadastrarAtendente(atendente: Pick<AtendenteRecord, 'nome' | 'email' | 'senha' | 'telefone'>) {
    return this.supabase.from('atendente').insert([atendente]).select().single();
  }

  async emailAtendenteExiste(email: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('atendente')
      .select('id')
      .eq('email', email).single();
    return !!data;
  }

  getUsers() {
    return this.supabase.from('usuarios').select('*');
  }

  createUser(user: Omit<UsuarioRecord, 'id' | 'criado_em'>) {
    return this.supabase.from('usuarios').insert([user]);
  }
}
