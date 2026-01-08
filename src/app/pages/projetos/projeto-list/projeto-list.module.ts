import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProjetoListPageRoutingModule } from './projeto-list-routing.module';

import { ProjetoListPage } from './projeto-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProjetoListPageRoutingModule
  ],
  declarations: [ProjetoListPage]
})
export class ProjetoListPageModule {}
