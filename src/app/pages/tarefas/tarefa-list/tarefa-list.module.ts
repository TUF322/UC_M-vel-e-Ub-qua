import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TarefaListPageRoutingModule } from './tarefa-list-routing.module';

import { TarefaListPage } from './tarefa-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TarefaListPageRoutingModule
  ],
  declarations: [TarefaListPage]
})
export class TarefaListPageModule {}
