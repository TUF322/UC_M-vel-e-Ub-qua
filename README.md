# Gestão de Tarefas - Aplicação Móvel

Aplicação móvel desenvolvida com Ionic + Angular (NgModules) para gestão de tarefas, projetos e categorias.

## 🚀 Tecnologias

- **Ionic 8** - Framework para desenvolvimento móvel
- **Angular 20** - Framework web (NgModules)
- **Capacitor 8** - Runtime nativo
- **TypeScript** - Linguagem de programação
- **Ionic Storage** - Persistência de dados local
- **SQLite** - Base de dados local (via @capacitor-community/sqlite)

## 📱 Plugins Capacitor

A aplicação utiliza os seguintes plugins do Capacitor:

- **@capacitor/app** - Controlo do ciclo de vida da aplicação
- **@capacitor/camera** - Captura de imagens para tarefas
- **@capacitor/haptics** - Feedback háptico (instalado, pronto para uso)
- **@capacitor/keyboard** - Controlo do teclado virtual
- **@capacitor/local-notifications** - Notificações locais (instalado, pronto para Fase 9)
- **@capacitor/screen-orientation** - Controlo de orientação (portrait bloqueado)
- **@capacitor/status-bar** - Controlo da barra de status
- **@capacitor-community/sqlite** - Base de dados SQLite local

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

## ✅ Fase 4 - Concluída

- ✅ Página de listagem de projetos criada
- ✅ Página de detalhes do projeto criada
- ✅ Página de adicionar/editar projeto criada
- ✅ Funcionalidade criar projeto implementada
- ✅ Funcionalidade editar projeto implementada
- ✅ Funcionalidade eliminar projeto implementada
- ✅ Eliminação de tarefas ao eliminar projeto
- ✅ Filtro por categoria implementado
- ✅ Visualização por categoria funcionando
- ✅ Indicador de tarefas em atraso

## ✅ Fase 5 - Concluída

- ✅ Página de listagem de tarefas criada
- ✅ Página de detalhes da tarefa criada
- ✅ Página de adicionar/editar tarefa criada
- ✅ Funcionalidade adicionar tarefa implementada
- ✅ Funcionalidade editar tarefa implementada
- ✅ Funcionalidade eliminar tarefa implementada
- ✅ Funcionalidade ordenar tarefas (lógica no service)
- ✅ Funcionalidade mover tarefa entre projetos
- ✅ Upload/captura de imagem implementado
- ✅ Identificação de tarefas em atraso
- ✅ Filtros de tarefas (todas, pendentes, concluídas, em atraso)
- ✅ Validação de formulários
- ✅ Seletor de data (ion-datetime)

## ✅ Fase 6 - Concluída

- ✅ Página de calendário criada
- ✅ Calendário customizado implementado
- ✅ Exibição de datas limite das tarefas no calendário
- ✅ Marcação de dias com tarefas
- ✅ Diferenciação visual (atraso vs. normal)
- ✅ Seleção de data funcionando
- ✅ Lista de tarefas da data selecionada
- ✅ Navegação para detalhes da tarefa
- ✅ Edição de tarefa a partir do calendário
- ✅ Navegação entre meses
- ✅ Botão para voltar ao mês atual

## ✅ Fase 7 - Concluída

- ✅ Configuração completa de rotas no app-routing.module.ts
- ✅ Rotas filhas (child routes) configuradas
- ✅ Navegação com parâmetros implementada (Router, ActivatedRoute)
- ✅ Menu lateral (sidemenu) criado
- ✅ Links de navegação: Home, Projetos, Tarefas, Calendário, Categorias
- ✅ Navegação consistente em toda a aplicação
- ✅ Botões de menu nas páginas principais
- ✅ Botões de voltar nas páginas de detalhes e formulários
- ✅ Passagem de parâmetros entre páginas funcionando
- ✅ Todas as rotas testadas e funcionando

## ✅ Fase 8 - Concluída

- ✅ Capacitor instalado e configurado
- ✅ Configuração completa no capacitor.config.ts
- ✅ Controlo de orientação implementado (portrait bloqueado)
- ✅ Listener para mudanças de orientação (força portrait se mudar)
- ✅ Status Bar configurada (tema dark)
- ✅ Keyboard configurado (melhor UX)
- ✅ Listener para app state (reconfigura ao voltar ao foreground)
- ✅ Plugins necessários instalados e configurados
- ✅ Documentação completa no código

## ✅ Fase 9 - Concluída

- ✅ Plugin de notificações locais instalado (@capacitor/local-notifications)
- ✅ Serviço de notificações criado (NotificacaoService)
- ✅ Solicitação de permissões implementada
- ✅ Agendamento de notificações para tarefas próximas da data limite
- ✅ Configuração de frequência (3 dias antes, 1 dia antes, no dia)
- ✅ Integração com TarefaService (agenda ao criar, atualiza ao editar, cancela ao eliminar)
- ✅ Cancelamento de notificações ao eliminar tarefas
- ✅ Atualização de notificações ao editar tarefas
- ✅ Inicialização automática ao iniciar a aplicação
- ✅ Não agenda notificações para tarefas concluídas

## ✅ Fase 10 - Concluída

- ✅ Design minimalista estilo "nothing" aplicado
- ✅ Tema dark com cores escuras (#0a0a0a, #121212, #1a1a1a)
- ✅ Cores roxas como destaque principal
- ✅ Fontes monospace para elementos tech/console
- ✅ Cards com bordas finas e estilo clean
- ✅ Efeitos glow roxo (estilo tech)
- ✅ Menu lateral minimalista com bordas laterais
- ✅ Botões estilo console com bordas finas
- ✅ Inputs com estilo tech
- ✅ Scrollbar minimalista
- ✅ Feedback visual melhorado (hover, focus)
- ✅ Tipografia otimizada (letter-spacing, font-weight)
- ✅ Espaçamentos consistentes
- ✅ Animações suaves e transições

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
