import { Component, OnInit } from '@angular/core';

import { SupabaseService } from './supabase.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  public tickets: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadTickets();
  }

  async loadTickets() {
    const { data, error } = await this.supabaseService.getTickets();

    if (error) {
      console.error('Erro ao buscar tickets do Supabase:', error);
      return;
    }

    this.tickets = data ?? [];
  }
}
