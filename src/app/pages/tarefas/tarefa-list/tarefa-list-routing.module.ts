import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TarefaListPage } from './tarefa-list.page';

const routes: Routes = [
  {
    path: '',
    component: TarefaListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TarefaListPageRoutingModule {}
