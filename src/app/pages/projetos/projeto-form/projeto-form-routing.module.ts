import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjetoFormPage } from './projeto-form.page';

const routes: Routes = [
  {
    path: '',
    component: ProjetoFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjetoFormPageRoutingModule {}
