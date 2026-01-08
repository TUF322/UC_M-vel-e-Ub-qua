import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TarefaFormPage } from './tarefa-form.page';

describe('TarefaFormPage', () => {
  let component: TarefaFormPage;
  let fixture: ComponentFixture<TarefaFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TarefaFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
