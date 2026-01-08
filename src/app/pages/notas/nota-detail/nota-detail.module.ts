import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotaDetailPageRoutingModule } from './nota-detail-routing.module';

import { NotaDetailPage } from './nota-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotaDetailPageRoutingModule
  ],
  declarations: [NotaDetailPage]
})
export class NotaDetailPageModule {}

