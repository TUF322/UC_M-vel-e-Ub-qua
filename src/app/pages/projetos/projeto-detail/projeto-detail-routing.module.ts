import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjetoDetailPage } from './projeto-detail.page';

const routes: Routes = [
  {
    path: '',
    component: ProjetoDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjetoDetailPageRoutingModule {}
