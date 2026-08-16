import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { MessageComponentModule } from '../message/message.module';

import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot(), MessageComponentModule, RouterModule.forRoot([])]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the home menu with ticket counts', () => {
    const titles = component.menuOptions.map(option => option.title);

    expect(titles).toContain('Criar usuários');
    expect(titles).toContain('Tickets abertos');
    expect(titles).toContain('Tickets em andamento');
    expect(titles).toContain('Tickets fechados');

    expect(component.menuOptions.find(option => option.title === 'Tickets abertos')?.count).toBe(3);
    expect(component.menuOptions.find(option => option.title === 'Tickets em andamento')?.count).toBe(2);
    expect(component.menuOptions.find(option => option.title === 'Tickets fechados')?.count).toBe(4);
  });
});
