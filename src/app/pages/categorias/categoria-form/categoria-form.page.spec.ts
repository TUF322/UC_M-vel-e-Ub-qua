import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoriaFormPage } from './categoria-form.page';

describe('CategoriaFormPage', () => {
  let component: CategoriaFormPage;
  let fixture: ComponentFixture<CategoriaFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoriaFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
