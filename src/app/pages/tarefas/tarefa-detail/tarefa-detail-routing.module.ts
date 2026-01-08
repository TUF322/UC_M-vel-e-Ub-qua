import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TarefaDetailPage } from './tarefa-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TarefaDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TarefaDetailPageRoutingModule {}
