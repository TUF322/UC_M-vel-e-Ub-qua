import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjetoListPage } from './projeto-list.page';

const routes: Routes = [
  {
    path: '',
    component: ProjetoListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjetoListPageRoutingModule {}
