import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjetoListPage } from './projeto-list.page';

describe('ProjetoListPage', () => {
  let component: ProjetoListPage;
  let fixture: ComponentFixture<ProjetoListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjetoListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
