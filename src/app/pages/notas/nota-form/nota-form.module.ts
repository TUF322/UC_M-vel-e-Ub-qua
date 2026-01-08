import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotaFormPageRoutingModule } from './nota-form-routing.module';

import { NotaFormPage } from './nota-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotaFormPageRoutingModule
  ],
  declarations: [NotaFormPage]
})
export class NotaFormPageModule {}

