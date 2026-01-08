import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TarefaDetailPageRoutingModule } from './tarefa-detail-routing.module';

import { TarefaDetailPage } from './tarefa-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TarefaDetailPageRoutingModule
  ],
  declarations: [TarefaDetailPage]
})
export class TarefaDetailPageModule {}
