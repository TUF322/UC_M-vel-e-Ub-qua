import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotaListPageRoutingModule } from './nota-list-routing.module';

import { NotaListPage } from './nota-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotaListPageRoutingModule
  ],
  declarations: [NotaListPage]
})
export class NotaListPageModule {}

