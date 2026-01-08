import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotaListPage } from './nota-list.page';

const routes: Routes = [
  {
    path: '',
    component: NotaListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotaListPageRoutingModule {}

