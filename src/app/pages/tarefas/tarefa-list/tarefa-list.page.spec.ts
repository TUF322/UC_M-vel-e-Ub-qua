import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TarefaListPage } from './tarefa-list.page';

describe('TarefaListPage', () => {
  let component: TarefaListPage;
  let fixture: ComponentFixture<TarefaListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TarefaListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
