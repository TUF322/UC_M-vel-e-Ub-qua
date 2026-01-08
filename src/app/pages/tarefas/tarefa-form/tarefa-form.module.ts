import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TarefaFormPageRoutingModule } from './tarefa-form-routing.module';

import { TarefaFormPage } from './tarefa-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TarefaFormPageRoutingModule
  ],
  declarations: [TarefaFormPage]
})
export class TarefaFormPageModule {}
