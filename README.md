# Gestão de Tarefas - Aplicação Móvel

Aplicação móvel desenvolvida com Ionic + Angular (NgModules) para gestão de tarefas, projetos e categorias.

## 🚀 Tecnologias

- **Ionic 8** - Framework para desenvolvimento móvel
- **Angular 20** - Framework web (NgModules)
- **Capacitor 8** - Runtime nativo
- **TypeScript** - Linguagem de programação
- **Ionic Storage** - Persistência de dados local

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
ionic serve

# Build para produção
npm run build

# Sincronizar Capacitor
npx cap sync
```

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── models/          # Interfaces/Modelos de dados
│   ├── services/        # Serviços Angular
│   ├── pages/           # Páginas da aplicação
│   ├── components/      # Componentes reutilizáveis
│   ├── data/            # Ficheiros JSON (dados iniciais, strings)
│   ├── app.module.ts    # Módulo principal
│   └── app-routing.module.ts  # Rotas principais
├── assets/              # Recursos estáticos
├── theme/               # Tema e variáveis CSS
└── global.scss          # Estilos globais
```

## ✅ Fase 1 - Concluída

- ✅ Projeto Ionic criado com Angular (NgModules)
- ✅ Estrutura de pastas configurada
- ✅ Capacitor configurado
- ✅ Ionic Storage configurado
- ✅ Routing básico configurado
- ✅ Cores globais definidas (CSS Custom Properties)
- ✅ Estilos globais personalizados
- ✅ Controlo de orientação (portrait)
- ✅ Dados iniciais em JSON criados

## ✅ Fase 2 - Concluída

- ✅ Interfaces criadas (Categoria, Projeto, Tarefa)
- ✅ StorageService implementado (wrapper para Ionic Storage)
- ✅ CategoriaService implementado (CRUD completo)
- ✅ ProjetoService implementado (CRUD completo)
- ✅ TarefaService implementado (CRUD + ordenação + movimentação)
- ✅ StringService implementado (isolamento de strings)
- ✅ DataInitService implementado (inicialização de dados)
- ✅ Dados iniciais carregados do JSON
- ✅ Persistência configurada no Ionic Storage

## ✅ Fase 3 - Concluída

- ✅ Página de listagem de categorias criada
- ✅ Página de adicionar/editar categoria criada
- ✅ Funcionalidade adicionar categoria implementada
- ✅ Funcionalidade editar categoria implementada
- ✅ Funcionalidade eliminar categoria implementada
- ✅ Validação de categoria em uso antes de eliminar
- ✅ Navegação com parâmetros (ActivatedRoute) implementada
- ✅ Rotas configuradas com lazy loading
- ✅ UI completa com ícones, cores e preview
- ✅ Validações e tratamento de erros implementados

## 📋 Próximas Fases

- **Fase 2**: Modelos e Serviços Base
- **Fase 3**: Gestão de Categorias
- **Fase 4**: Gestão de Projetos
- **Fase 5**: Gestão de Tarefas
- **Fase 6**: Calendário
- **Fase 7**: Navegação e Routing completo
- **Fase 8**: Capacitor e Controlos adicionais
- **Fase 9**: Notificações (opcional)
- **Fase 10**: Melhorias e Otimizações
- **Fase 11**: Testes e Validação
- **Fase 12**: Documentação

## 🎨 Cores Globais

As cores estão definidas em `src/theme/variables.scss`:

- **Categorias**: Escola, Trabalho, Pessoal
- **Estados de Tarefas**: Atraso, Hoje, Futura, Concluída
- **Espaçamentos**: xs, sm, md, lg, xl

## 📱 Capacitor

A aplicação está configurada para:
- Bloquear orientação landscape (portrait apenas)
- Funcionar em Android e iOS
- Usar plugins nativos (Camera, Notificações, etc.)

## 📝 Notas

- **SQLite implementado!** A aplicação usa SQLite em dispositivos nativos e Ionic Storage no browser
- Dados sincronizados entre SQLite e Storage automaticamente
- A aplicação funciona offline
- Requisito opcional de base de dados externa cumprido ✅

---

**Desenvolvido para TPSI - Móvel**

# UC_M-vel-e-Ub-qua
