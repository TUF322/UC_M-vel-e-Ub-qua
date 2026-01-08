import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProjetoFormPageRoutingModule } from './projeto-form-routing.module';

import { ProjetoFormPage } from './projeto-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProjetoFormPageRoutingModule
  ],
  declarations: [ProjetoFormPage]
})
export class ProjetoFormPageModule {}
