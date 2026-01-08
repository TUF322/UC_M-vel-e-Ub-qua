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
  {
    path: 'projetos',
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/projetos/projeto-list/projeto-list.module').then(m => m.ProjetoListPageModule)
      },
      {
        path: 'novo',
        loadChildren: () => import('./pages/projetos/projeto-form/projeto-form.module').then(m => m.ProjetoFormPageModule)
      },
      {
        path: 'detalhes/:id',
        loadChildren: () => import('./pages/projetos/projeto-detail/projeto-detail.module').then(m => m.ProjetoDetailPageModule)
      },
      {
        path: 'editar/:id',
        loadChildren: () => import('./pages/projetos/projeto-form/projeto-form.module').then(m => m.ProjetoFormPageModule)
      }
    ]
  },
  {
    path: 'tarefas',
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/tarefas/tarefa-list/tarefa-list.module').then(m => m.TarefaListPageModule)
      },
      {
        path: 'nova',
        loadChildren: () => import('./pages/tarefas/tarefa-form/tarefa-form.module').then(m => m.TarefaFormPageModule)
      },
      {
        path: 'nova/:projetoId',
        loadChildren: () => import('./pages/tarefas/tarefa-form/tarefa-form.module').then(m => m.TarefaFormPageModule)
      },
      {
        path: 'detalhes/:id',
        loadChildren: () => import('./pages/tarefas/tarefa-detail/tarefa-detail.module').then(m => m.TarefaDetailPageModule)
      },
      {
        path: 'editar/:id',
        loadChildren: () => import('./pages/tarefas/tarefa-form/tarefa-form.module').then(m => m.TarefaFormPageModule)
      }
    ]
  },
  {
    path: 'calendario',
    loadChildren: () => import('./pages/calendario/calendario/calendario.module').then( m => m.CalendarioPageModule)
  },
  {
    path: 'notas',
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/notas/nota-list/nota-list.module').then(m => m.NotaListPageModule)
      },
      {
        path: 'nova',
        loadChildren: () => import('./pages/notas/nota-form/nota-form.module').then(m => m.NotaFormPageModule)
      },
      {
        path: 'detalhes/:id',
        loadChildren: () => import('./pages/notas/nota-detail/nota-detail.module').then(m => m.NotaDetailPageModule)
      },
      {
        path: 'editar/:id',
        loadChildren: () => import('./pages/notas/nota-form/nota-form.module').then(m => m.NotaFormPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
