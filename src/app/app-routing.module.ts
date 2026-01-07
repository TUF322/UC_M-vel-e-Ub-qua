import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

/**
 * Rotas principais da aplicação
 * Utiliza lazy loading para melhor performance
 */
const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'categorias',
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/categorias/categoria-list/categoria-list.module').then(m => m.CategoriaListPageModule)
      },
      {
        path: 'nova',
        loadChildren: () => import('./pages/categorias/categoria-form/categoria-form.module').then(m => m.CategoriaFormPageModule)
      },
      {
        path: 'editar/:id',
        loadChildren: () => import('./pages/categorias/categoria-form/categoria-form.module').then(m => m.CategoriaFormPageModule)
      }
    ]
  },
  // Rotas serão adicionadas nas próximas fases:
  // - projetos
  // - tarefas
  // - calendario
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
