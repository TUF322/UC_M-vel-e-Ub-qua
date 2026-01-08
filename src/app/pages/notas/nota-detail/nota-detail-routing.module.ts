import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotaDetailPage } from './nota-detail.page';

const routes: Routes = [
  {
    path: '',
    component: NotaDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotaDetailPageRoutingModule {}

