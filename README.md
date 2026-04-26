# Igreja Aliança Cristã e Missionária do Paraíso

Site oficial da **IACM Paraíso**, com publicação estática e manutenção simples.

## 1. Visão geral

Este repositório contém o site institucional da igreja. O projeto foi mantido como site estático para priorizar:

- carregamento rápido;
- hospedagem simples;
- baixo custo operacional;
- atualização direta de textos e imagens;
- compatibilidade com GitHub Pages;
- abertura local simples inclusive com `file://`.

Informações institucionais principais:

- **Culto:** domingos às **17h00**
- **Endereço:** Rua Itaipu, 422, Mirandópolis, São Paulo-SP
- **Referência:** próximo à estação de metrô Praça da Árvore

## 2. Público deste documento

Este README foi escrito para:

- equipe de comunicação;
- voluntários que atualizam o site;
- mantenedores técnicos do repositório;
- agentes locais de automação e validação visual.

## 3. Estrutura do projeto

```text
.
├── index.html
├── styles.css
├── favicon.ico
├── apple-touch-icon.png
├── assets/
│   ├── logo/
│   ├── events/
│   │   └── archive/
│   ├── js/
│   │   ├── events-data.js
│   │   └── site.js
│   └── painel.jpeg
├── .codex/
├── package.json
├── package-lock.json
├── site.webmanifest
├── robots.txt
├── sitemap.xml
├── llms.txt
└── README.md
```

Finalidade de cada parte:

- `index.html`: página principal do site.
- `styles.css`: estilos visuais e regras de responsividade.
- `favicon.ico`: favicon raiz para compatibilidade ampla com navegadores e ferramentas.
- `apple-touch-icon.png`: ícone raiz usado por dispositivos Apple ao salvar o site na tela inicial.
- `assets/`: arquivos estáticos do site.
- `assets/logo/`: logo principal e ícones PNG usados por navegador e manifesto web.
- `assets/js/events-data.js`: fonte única de verdade dos eventos exibidos no site e único arquivo de dados de eventos lido pela versão publicada.
- `assets/js/site.js`: interações leves executadas no navegador, inclusive a renderização da seção de eventos.
- `assets/painel.jpeg`: arte principal exibida no topo quando desejado.
- `assets/events/`: imagens dos eventos ativos exibidos no site.
- `assets/events/archive/`: histórico local de eventos encerrados e arquivos antigos de referência, sem uso pela versão publicada.
- `.codex/`: artefatos locais de apoio, como screenshots, arquivos temporários e logs.
- `package.json`: metadados do projeto e dependência local do Playwright.
- `site.webmanifest`, `robots.txt`, `sitemap.xml`, `llms.txt`: arquivos auxiliares de navegador, SEO e descoberta automatizada.

## 4. Execução local e validação

Esta seção reúne os fluxos de acesso local, teste manual e validação automatizada.

### 4.1 Acesso local rápido

Para uma inspeção simples de conteúdo, o site também funciona abrindo o arquivo diretamente no navegador:

```text
file:///caminho/para/o/projeto/index.html
```

Esse modo é útil para leitura rápida, mas não é o fluxo principal para manutenção.

### 4.2 Testes manuais

#### Fluxo recomendado

Para navegar localmente no site durante a manutenção:

```bash
npm run server
```

Esse comando usa `scripts/start-local-server.sh`, fixa a raiz correta do projeto e publica o site em:

```text
http://localhost:3000
```

#### Ajustes opcionais

É possível ajustar host e porta:

```bash
HOST=0.0.0.0 PORT=3001 npm run server
```

Também é possível subir um servidor HTTP direto:

```bash
python3 -m http.server 3000 --bind localhost
```

#### Como encerrar o servidor manual

Se o servidor estiver rodando no terminal atual, pressione:

```text
Ctrl+C
```

Se ele tiver sido iniciado por um task do VS Code, encerre o task no painel de execução ou feche o terminal dedicado usado pelo `serve:manual`.

#### VS Code Integrated Browser

O projeto inclui configuração pronta para o navegador integrado do VS Code em `.vscode/launch.json`.

Essa configuração segue o fluxo oficial do VS Code para o **Integrated Browser**:

- usar uma configuração `editor-browser` em `.vscode/launch.json`;
- abrir a versão manual do site em `http://localhost:3000`;
- permitir que links locais em `localhost` sejam abertos no navegador integrado.

Fluxo recomendado:

1. abrir o painel **Run and Debug**;
2. executar `Start Server and Open in Integrated Browser`;
3. deixar o task `serve:manual` subir o servidor em `http://localhost:3000`;
4. usar `Attach to Site in Integrated Browser` quando o navegador integrado já estiver aberto.

Arquivos relacionados:

- `.vscode/launch.json`: configurações `editor-browser` para abrir ou anexar no navegador integrado;
- `.vscode/tasks.json`: task de servidor local usada antes do launch;
- `.vscode/settings.json`: preferência para abrir links `localhost` no navegador integrado, usar o navegador integrado com o Live Preview e mostrar o atalho do navegador na barra de título.

### 4.3 Testes automatizados

#### Servidor local para automação

Os testes automatizados e a captura de screenshots usam uma porta separada para evitar conflito com a navegação manual:

```bash
npm run server:test
```

Esse comando publica o mesmo site em:

```text
http://127.0.0.1:4173
```

Essa separação é possível porque os eventos são carregados por `assets/js/events-data.js`, sem depender de `fetch`.

#### Quando usar essa porta

Use `http://127.0.0.1:4173` para:

- `npm test`;
- `npm run screenshots`;
- comandos avulsos de Playwright.

#### Playwright para validação visual

Este repositório usa **Playwright local** para revisão visual assistida.

##### Situação atual do projeto

O repositório já possui:

- `package.json`;
- `package-lock.json`;
- `playwright` em `devDependencies`.

Isso permite usar Playwright localmente com `npx` e também usar scripts Node locais com `require('playwright')` ou `import { chromium } from 'playwright'`.

##### Instalação inicial

Ao clonar o repositório em uma máquina nova:

```bash
npm install
npx playwright install chromium
```

Observações:

- `npm install` instala a dependência JavaScript local em `node_modules/`;
- `npx playwright install chromium` instala o navegador gerenciado pelo Playwright;
- os binários do navegador ficam normalmente em `~/.cache/ms-playwright/`;
- `node_modules/` é local e está ignorado no Git.

##### Scripts disponíveis

```bash
npm run server
npm run server:test
npm run playwright:install
npm test
npm run screenshots
```

##### Captura de screenshots

Desktop:

```bash
npx playwright screenshot --device="Desktop Chrome HiDPI" http://127.0.0.1:4173 .codex/screenshots/screenshot-home.png
```

Celular:

```bash
npx playwright screenshot --device="Pixel 7" http://127.0.0.1:4173 .codex/screenshots/screenshot-mobile.png
```

Regra operacional:

- toda alteração visual ou de layout deve gerar screenshots novos antes da conclusão da tarefa;
- salvar as capturas em `.codex/screenshots/`;
- considerar a geração de screenshots como validação obrigatória, não opcional;
- capturar a página ou a seção realmente impactada pela alteração, não apenas o topo da home;
- em site de página única, rolar até a seção afetada e registrar essa área também;
- revisar as screenshots geradas para confirmar que a alteração ficou correta e com boa qualidade visual.

##### Fluxo recomendado com LLM

1. Editar HTML, CSS ou JavaScript.
2. Subir o servidor local quando necessário.
3. Gerar screenshot com Playwright.
4. Revisar o resultado visual.
5. Repetir até o layout ficar correto.

Boas práticas:

- validar em desktop e celular quando a mudança afetar layout;
- não confiar apenas em cálculo teórico de altura e largura;
- usar screenshots de viewport quando a dúvida for “o que aparece na primeira tela”;
- usar screenshot full page quando a dúvida for “o que existe no documento inteiro”.

## 5. Manutenção de conteúdo

As atualizações mais comuns são:

### 5.1 Horário, endereço e textos institucionais

Editar diretamente em `index.html`.

Antes de publicar, revisar:

- horário do culto;
- endereço completo;
- referência de localização;
- links externos;
- consistência da linguagem institucional.

### 5.2 Imagens institucionais

Adicionar ou substituir arquivos em `assets/`.

Boas práticas:

- preferir imagens otimizadas para web;
- usar nomes de arquivo claros;
- evitar arquivos excessivamente pesados;
- preservar boa qualidade para logo, painel e imagens principais.

### 5.3 Links externos

Ao revisar links para mapa ou redes sociais, confirmar:

- destino correto;
- texto coerente com o destino;
- funcionamento em desktop e celular.

### 5.4 Uso do painel principal

O topo do site pode usar:

- `assets/painel.jpeg`

Essa imagem funciona como peça principal de comunicação quando há campanha ativa.

Exemplos de uso:

- aniversário da igreja;
- conferências;
- cultos temáticos;
- convites especiais.

#### Quando usar

Usar `painel.jpeg` quando a igreja quiser destacar uma arte promocional no primeiro bloco do site.

#### Quando não usar

Se não houver campanha ativa, o mais adequado é manter a imagem institucional padrão do site.

#### Fluxo recomendado de atualização

1. preparar a nova arte final;
2. salvar como `assets/painel.jpeg`;
3. revisar o topo em desktop e celular;
4. validar contraste e legibilidade;
5. publicar somente após conferência.

Cuidados importantes:

- tratar o painel como peça principal da primeira impressão do site;
- testar sempre em telas grandes e pequenas;
- verificar textos incorporados à própria arte;
- remover campanhas antigas quando deixarem de ser vigentes.

#### Comportamento das margens do painel em telas pequenas

A borda branca ao redor da imagem principal é calculada dinamicamente pelo navegador para se ajustar a qualquer tamanho de celular, garantindo que o painel sempre funcione como um quadro. O layout segue 4 regras funcionais estritas:

1. As **4 margens brancas** (superior, inferior, esquerda e direita) estarão sempre visíveis.
2. A borda mais estreita terá sempre o tamanho exato de **8px**, de modo que a imagem aproveite ao máximo o espaço sem encostar nos limites.
3. A margem direita será sempre igual à margem esquerda.
4. A margem superior será sempre igual à margem inferior.

Esse mecanismo garante que imagens com diferentes proporções (mais altas ou mais largas) não sofram cortes e permaneçam perfeitamente emolduradas de forma automática. O conjunto de testes automatizados valida constantemente essas 4 exigências matemáticas a cada alteração.

### 5.5 Gestão de eventos

O site possui uma seção própria para eventos.

Pastas e arquivos relacionados:

- `assets/js/events-data.js`: fonte única de verdade dos eventos ativos e único arquivo de dados carregado pelo site publicado;
- `assets/events/`: imagens dos eventos ativos que devem aparecer no site;
- `assets/events/archive/`: arquivos de histórico, incluindo artes e dados antigos, sem uso pela versão publicada;
- `assets/events/archive/events-data.js`: registro histórico dos eventos já encerrados.

#### Regra principal

Para evitar ambiguidade durante a manutenção:

- use `assets/js/events-data.js` para adicionar, remover ou reordenar eventos ativos;
- trate qualquer arquivo dentro de `assets/events/archive/` como histórico apenas;
- mantenha `assets/events/archive/events-data.js` com a lista completa dos eventos passados;
- nunca edite um arquivo de `archive` esperando mudar o que aparece no site publicado.

#### Como o site trata os eventos

Cada item listado em `assets/js/events-data.js` representa um item da seção `Eventos`.

Cada item deve informar:

- `file`: nome do arquivo presente em `assets/events/`;
- `title`: título que será exibido como heading do evento no site.

Exemplo:

```js
window.EVENTS_DATA = Object.freeze([
  {
    file: 'event1-o-reino-dos-ceus-2026.jpeg',
    title: 'O Reino dos Céus'
  },
  {
    file: 'event2-o-reino-dos-ceus-parte-2.jpeg',
    title: 'O Reino dos Céus II'
  }
]);
```

Regra de ordenação:

- o site exibe os eventos exatamente na sequência definida em `assets/js/events-data.js`;
- a primeira entrada vira o primeiro heading e a primeira imagem;
- a segunda entrada vira o segundo heading e a segunda imagem;
- a ordem alfabética dos arquivos não é usada para montagem da seção.

Fluxo técnico:

- `assets/js/events-data.js` é a única fonte de verdade dos eventos;
- `assets/js/site.js` lê esse arquivo diretamente no navegador;
- arquivos como `assets/events/archive/events-data.js` existem apenas como referência histórica e não são carregados pelo site;
- `assets/events/archive/events-data.js` deve funcionar como catálogo histórico dos eventos já realizados;
- isso mantém compatibilidade com GitHub Pages e também com abertura por `file://`.

Comportamento sem eventos:

- se `window.EVENTS_DATA` estiver vazio, o botão `Eventos` não deve aparecer no topo;
- a seção inteira de eventos deve ficar oculta;
- o site não deve exibir a mensagem “Nenhum evento disponível no momento.” na interface pública.

#### Fluxo recomendado

Para publicar um novo evento:

1. preparar a arte final;
2. salvar o arquivo em `assets/events/`;
3. adicionar a entrada correspondente em `assets/js/events-data.js`;
4. revisar o site localmente;
5. publicar após validação.

Quando o evento terminar:

1. remover a entrada correspondente de `assets/js/events-data.js`;
2. remover a arte de `assets/events/`;
3. mover o arquivo para `assets/events/archive/`;
4. registrar o evento em `assets/events/archive/events-data.js`;
5. revisar o site novamente;
6. publicar a atualização.

Boas práticas:

- usar nomes de arquivo claros;
- preferir imagens otimizadas para web;
- manter `assets/js/events-data.js` consistente com os arquivos realmente existentes em `assets/events/`;
- manter apenas eventos realmente ativos em `assets/events/`;
- remover do arquivo qualquer evento cuja imagem tenha sido apagada.

#### Regra prática importante

Nunca deixe um item em `assets/js/events-data.js` apontando para uma imagem que já não existe em `assets/events/`.

Se isso acontecer:

- o título poderá ser criado primeiro;
- a imagem falhará ao carregar;
- o navegador removerá esse item da lista após detectar erro de imagem.

Mesmo com essa proteção, a prática correta continua sendo manter os dados sincronizados manualmente.

## 6. Padrões de qualidade

### 6.1 Diretrizes editoriais

O conteúdo do site deve manter:

- tom acolhedor;
- linguagem clara;
- reverência e simplicidade;
- coerência com a identidade da igreja.

Visualmente, o site deve valorizar:

- o logo oficial;
- as cores institucionais;
- uma estética limpa e respeitosa;
- boa legibilidade em telas pequenas e grandes.

### 6.2 Responsividade e acessibilidade

Toda alteração relevante deve ser validada em:

- celular;
- tablet;
- notebook;
- desktop.

Também é recomendável verificar:

- contraste entre texto e fundo;
- tamanho legível de fontes;
- botões fáceis de tocar no celular;
- presença de textos alternativos em imagens importantes, quando aplicável.

### 6.3 Uso da pasta `.codex/`

Esta pasta é reservada para uso local do agente e apoio operacional.

Estrutura sugerida:

- `.codex/screenshots/`: capturas temporárias de validação;
- `.codex/tmp/`: arquivos temporários de teste e scripts auxiliares;
- `.codex/logs/`: logs locais, quando necessários.

Regras operacionais:

- `.codex/` não faz parte do conteúdo do site;
- screenshots e artefatos temporários devem ficar em `.codex/`, não na raiz do projeto;
- recomenda-se apagar artefatos antigos periodicamente.

## 7. Publicação

Fluxo básico de publicação:

1. Fazer as alterações localmente.
2. Testar visualmente o site.
3. Revisar textos, links e imagens.
4. Fazer commit.
5. Enviar para o repositório.
6. Validar a versão publicada.

Exemplo:

```bash
git add .
git commit -m "Atualiza conteúdo do site"
git push
```

Checklist antes de publicar:

- [ ] horário do culto correto;
- [ ] endereço correto;
- [ ] imagens carregando corretamente;
- [ ] links externos funcionando;
- [ ] layout responsivo revisado;
- [ ] grafia revisada em português;
- [ ] versão publicada conferida após o push.

## 8. Segurança e continuidade

Mesmo sendo um site estático, é importante:

- não publicar senhas, tokens ou credenciais;
- revisar links externos antes de divulgar;
- evitar dependências desnecessárias de terceiros;
- manter o conteúdo oficial sob controle da igreja.

Também é recomendável que pelo menos duas pessoas saibam:

- onde está o repositório;
- como publicar uma nova versão;
- como restaurar uma versão anterior.

Se uma publicação quebrar o site:

1. voltar ao último commit estável;
2. republicar a versão anterior;
3. corrigir o problema localmente;
4. publicar novamente somente após novo teste.

## 9. Evolução futura

Possíveis próximos passos do projeto:

- página própria para programação e agenda;
- área de ministérios;
- galeria de fotos;
- integração com redes sociais;
- formulário de contato;
- expansão futura para outros sites institucionais da igreja.

## 10. Licença e uso institucional

Salvo definição diferente da igreja, este projeto deve ser tratado como material institucional da **Igreja Aliança Cristã e Missionária do Paraíso**, com uso e manutenção controlados pela equipe responsável.
