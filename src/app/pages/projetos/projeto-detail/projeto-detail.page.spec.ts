import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjetoDetailPage } from './projeto-detail.page';

describe('ProjetoDetailPage', () => {
  let component: ProjetoDetailPage;
  let fixture: ComponentFixture<ProjetoDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjetoDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
