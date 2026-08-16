import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { inject } from '@angular/core';

interface Ticket {
  id: number;
  title: string;
  status: 'aberto' | 'em-andamento' | 'fechado';
}

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.page.html',
  styleUrls: ['./tickets.page.scss'],
  standalone: false,
})
export class TicketsPage {
  private route = inject(ActivatedRoute);

  public status: string = 'abertos';
  public tickets: Ticket[] = [
    { id: 1, title: 'Ticket 1', status: 'aberto' },
    { id: 2, title: 'Ticket 2', status: 'aberto' },
    { id: 3, title: 'Ticket 3', status: 'aberto' },
    { id: 4, title: 'Ticket 4', status: 'em-andamento' },
    { id: 5, title: 'Ticket 5', status: 'em-andamento' },
    { id: 6, title: 'Ticket 6', status: 'fechado' },
    { id: 7, title: 'Ticket 7', status: 'fechado' },
    { id: 8, title: 'Ticket 8', status: 'fechado' },
    { id: 9, title: 'Ticket 9', status: 'fechado' },
  ];

  constructor() {
    const statusFromRoute = this.route.snapshot.paramMap.get('status');
    if (statusFromRoute) {
      this.status = statusFromRoute;
    }
  }

  getFilteredTickets(): Ticket[] {
    switch (this.status) {
      case 'abertos':
        return this.tickets.filter(ticket => ticket.status === 'aberto');
      case 'em-andamento':
        return this.tickets.filter(ticket => ticket.status === 'em-andamento');
      case 'fechados':
        return this.tickets.filter(ticket => ticket.status === 'fechado');
      default:
        return this.tickets;
    }
  }
}
