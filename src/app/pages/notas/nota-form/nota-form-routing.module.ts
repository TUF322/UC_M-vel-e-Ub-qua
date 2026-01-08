import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotaFormPage } from './nota-form.page';

const routes: Routes = [
  {
    path: '',
    component: NotaFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotaFormPageRoutingModule {}

