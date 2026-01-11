# Gestão de Tarefas

Aplicação móvel desenvolvida com Ionic/Angular para gestão de tarefas, projetos e notas.

## Fases do Projeto

### Fase 1: Estrutura Base
- [x] Concluída

### Fase 2: Modelos e Serviços
- [x] Concluída

### Fase 3: Gestão de Categorias
- [x] Concluída

### Fase 4: Gestão de Projetos
- [x] Concluída

### Fase 5: Gestão de Tarefas
- [x] Concluída

### Fase 6: Calendário
- [x] Concluída

### Fase 7: Navegação e Routing
- [x] Concluída

### Fase 8: Capacitor e Controlos
- [x] Concluída

### Fase 9: Notificações
- [x] Concluída

### Fase 10: Interface e Estilos
- [x] Concluída

## Pré-requisitos

- [ ] Node.js instalado (v18 ou superior)
- [ ] Ionic CLI instalado (`npm install -g @ionic/cli`)
- [ ] Android Studio instalado (para Android)
- [ ] API key do OpenWeatherMap (opcional, para funcionalidade de clima)

## Instalação e Execução

### 1. Instalar Dependências

Após descarregar o projeto, instale as dependências:

```bash
npm install
```

### 2. Configurar API Keys (Opcional)

Se pretender usar a funcionalidade de clima (OpenWeatherMap):

1. Crie um ficheiro `.env` na raiz do projeto
2. Adicione a sua API key:
   ```
   WEATHER_API_KEY=sua_api_key_aqui
   ```
3. Execute o script de geração:
   ```bash
   npm run generate-env
   ```

**Nota:** O ficheiro `.env` está no `.gitignore` e não deve ser commitado. Obtenha uma API key gratuita em: https://openweathermap.org/api

### 3. Executar Versão Web

Para desenvolvimento e testes no navegador:

```bash
npm start
```

A aplicação estará disponível em `http://localhost:8100`

### 4. Executar no Emulador Android

#### Passo 1: Sincronizar com Capacitor

```bash
npx cap sync
```

#### Passo 2: Abrir no Android Studio

```bash
npx cap open android
```

#### Passo 3: Executar no Emulador

1. No Android Studio, clique em "Run" (ou pressione Shift+F10)
2. Selecione o emulador Android desejado
3. Aguarde a aplicação instalar e iniciar

#### Alternativa: Via linha de comandos (se tiver Android SDK configurado)

```bash
cd android
./gradlew installDebug
adb shell am start -n io.ionic.gestaotarefas/.MainActivity
```

## Scripts Disponíveis

- `npm start` - Inicia servidor de desenvolvimento (versão web)
- `npm run build` - Gera build de produção
- `npm run generate-env` - Gera ficheiros de ambiente a partir do `.env`
- `npx cap sync` - Sincroniza código web com projetos nativos
- `npx cap open android` - Abre projeto Android no Android Studio

## Tecnologias

- **Ionic 8** - Framework UI móvel
- **Angular 20** - Framework web
- **Capacitor 8** - Bridge para funcionalidades nativas
- **SQLite** - Base de dados local
- **TypeScript** - Linguagem de programação

## Estrutura do Projeto

```
gestao-tarefas/
├── src/
│   ├── app/
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços e lógica de negócio
│   │   ├── models/         # Modelos de dados
│   │   └── ...
│   ├── assets/             # Recursos estáticos
│   └── environments/       # Configurações de ambiente
├── android/                # Projeto Android nativo
├── www/                    # Build web
└── capacitor.config.ts     # Configuração do Capacitor
```

---

**Desenvolvido para TPSI - Móvel**
