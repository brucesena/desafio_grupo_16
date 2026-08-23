import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { inject } from '@angular/core';

import { SupabaseService, TicketRecord, TicketStatus } from '../supabase.service';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.page.html',
  styleUrls: ['./tickets.page.scss'],
  standalone: false,
})
export class TicketsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);

  public status: string = 'novos';
  public tickets: TicketRecord[] = [];

  ngOnInit() {
    const statusFromRoute = this.route.snapshot.paramMap.get('status');
    if (statusFromRoute) {
      this.status = statusFromRoute;
    }

    this.loadTickets();
  }

  loadTickets = async () => {
    try {
      const statusMap: Record<string, TicketStatus> = {
        novos: 'novo',
        'em-andamento': 'em-andamento',
        fechados: 'fechado',
      };

      if (this.status === 'todos') {
        const { data, error } = await this.supabaseService.getTickets();

        if (error) {
          console.error('Erro ao buscar todos os tickets:', error);
          return;
        }

        this.tickets = data ?? [];
        return;
      }

      const selectedStatus = statusMap[this.status] ?? 'novo';
      const { data, error } = await this.supabaseService.getTickets(selectedStatus);

      if (error) {
        console.error('Erro ao buscar tickets:', error);
        return;
      }

      this.tickets = data ?? [];
    } catch (error) {
      console.error('Erro ao carregar tickets do Supabase:', error);
    }
  }

  getFilteredTickets(): TicketRecord[] {
    return this.tickets;
  }
}
