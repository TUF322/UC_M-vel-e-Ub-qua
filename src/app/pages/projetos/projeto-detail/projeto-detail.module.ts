import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProjetoDetailPageRoutingModule } from './projeto-detail-routing.module';

import { ProjetoDetailPage } from './projeto-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProjetoDetailPageRoutingModule
  ],
  declarations: [ProjetoDetailPage]
})
export class ProjetoDetailPageModule {}
