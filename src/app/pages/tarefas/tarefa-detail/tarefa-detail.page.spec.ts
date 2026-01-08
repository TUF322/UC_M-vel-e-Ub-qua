import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TarefaDetailPage } from './tarefa-detail.page';

describe('TarefaDetailPage', () => {
  let component: TarefaDetailPage;
  let fixture: ComponentFixture<TarefaDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TarefaDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
