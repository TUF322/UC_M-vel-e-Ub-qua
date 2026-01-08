import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjetoFormPage } from './projeto-form.page';

describe('ProjetoFormPage', () => {
  let component: ProjetoFormPage;
  let fixture: ComponentFixture<ProjetoFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjetoFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
