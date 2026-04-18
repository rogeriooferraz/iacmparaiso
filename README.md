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
│   ├── js/
│   │   ├── events-data.js
│   │   └── site.js
│   └── painel.jpeg
├── events/
├── archive/
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
- `assets/js/events-data.js`: fonte única de verdade dos eventos exibidos no site.
- `assets/js/site.js`: interações leves executadas no navegador, inclusive a renderização da seção de eventos.
- `assets/painel.jpeg`: arte principal exibida no topo quando desejado.
- `events/`: imagens dos eventos ativos exibidos no site.
- `archive/`: artes de eventos encerrados, mantidas apenas para histórico local.
- `.codex/`: artefatos locais de apoio, como screenshots, arquivos temporários e logs.
- `package.json`: metadados do projeto e dependência local do Playwright.
- `site.webmanifest`, `robots.txt`, `sitemap.xml`, `llms.txt`: arquivos auxiliares de navegador, SEO e descoberta automatizada.

## 4. Execução local

O site pode ser executado localmente de duas formas simples.

Abrindo o arquivo diretamente no navegador:

```text
file:///caminho/para/o/projeto/index.html
```

Servidor HTTP direto:

```bash
python3 -m http.server 4173
```

Script do projeto:

```bash
npm run serve
```

Se usar servidor local, acessar:

```text
http://127.0.0.1:4173
```

Observação:

- o site foi ajustado para funcionar tanto com servidor local quanto abrindo `index.html` diretamente;
- isso é possível porque os eventos são carregados por `assets/js/events-data.js`, sem depender de `fetch`.

## 5. Atualização de conteúdo

As atualizações mais comuns são:

### Horário, endereço e textos institucionais

Editar diretamente em `index.html`.

Antes de publicar, revisar:

- horário do culto;
- endereço completo;
- referência de localização;
- links externos;
- consistência da linguagem institucional.

### Imagens institucionais

Adicionar ou substituir arquivos em `assets/`.

Boas práticas:

- preferir imagens otimizadas para web;
- usar nomes de arquivo claros;
- evitar arquivos excessivamente pesados;
- preservar boa qualidade para logo, painel e imagens principais.

### Links externos

Ao revisar links para mapa ou redes sociais, confirmar:

- destino correto;
- texto coerente com o destino;
- funcionamento em desktop e celular.

## 6. Diretrizes editoriais

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

## 7. Responsividade e acessibilidade

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

## 8. Publicação

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

## 9. Playwright para validação visual

Este repositório usa **Playwright local** para revisão visual assistida.

### Situação atual do projeto

O repositório já possui:

- `package.json`;
- `package-lock.json`;
- `playwright` em `devDependencies`.

Isso permite usar Playwright localmente com `npx` e também usar scripts Node locais com `require('playwright')` ou `import { chromium } from 'playwright'`.

### Instalação inicial

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

### Scripts disponíveis

```bash
npm run serve
npm run playwright:install
npm run screenshots
```

### Captura de screenshots

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

### Fluxo recomendado com LLM

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

## 10. Uso da pasta `.codex/`

Esta pasta é reservada para uso local do agente e apoio operacional.

Estrutura sugerida:

- `.codex/screenshots/`: capturas temporárias de validação;
- `.codex/tmp/`: arquivos temporários de teste e scripts auxiliares;
- `.codex/logs/`: logs locais, quando necessários.

Regras operacionais:

- `.codex/` não faz parte do conteúdo do site;
- screenshots e artefatos temporários devem ficar em `.codex/`, não na raiz do projeto;
- recomenda-se apagar artefatos antigos periodicamente.

## 11. Gestão de eventos

O site possui uma seção própria para eventos.

Pastas e arquivos relacionados:

- `assets/js/events-data.js`: fonte única de verdade dos eventos ativos;
- `events/`: imagens dos eventos ativos que devem aparecer no site;
- `archive/`: eventos encerrados, mantidos apenas para histórico local.

### Como o site trata os eventos

Cada item listado em `assets/js/events-data.js` representa um item da seção `Eventos`.

Cada item deve informar:

- `file`: nome do arquivo presente em `events/`;
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
- isso mantém compatibilidade com GitHub Pages e também com abertura por `file://`.

Comportamento sem eventos:

- se `window.EVENTS_DATA` estiver vazio, o botão `Eventos` não deve aparecer no topo;
- a seção inteira de eventos deve ficar oculta;
- o site não deve exibir a mensagem “Nenhum evento disponível no momento.” na interface pública.

### Fluxo recomendado

Para publicar um novo evento:

1. preparar a arte final;
2. salvar o arquivo em `events/`;
3. adicionar a entrada correspondente em `assets/js/events-data.js`;
4. revisar o site localmente;
5. publicar após validação.

Quando o evento terminar:

1. remover a entrada correspondente de `assets/js/events-data.js`;
2. remover a arte de `events/`;
3. mover o arquivo para `archive/`;
4. revisar o site novamente;
5. publicar a atualização.

Boas práticas:

- usar nomes de arquivo claros;
- preferir imagens otimizadas para web;
- manter `assets/js/events-data.js` consistente com os arquivos realmente existentes em `events/`;
- manter apenas eventos realmente ativos em `events/`;
- remover do arquivo qualquer evento cuja imagem tenha sido apagada.

### Regra prática importante

Nunca deixe um item em `assets/js/events-data.js` apontando para uma imagem que já não existe em `events/`.

Se isso acontecer:

- o título poderá ser criado primeiro;
- a imagem falhará ao carregar;
- o navegador removerá esse item da lista após detectar erro de imagem.

Mesmo com essa proteção, a prática correta continua sendo manter os dados sincronizados manualmente.

## 12. Uso do painel principal

O topo do site pode usar:

- `assets/painel.jpeg`

Essa imagem funciona como peça principal de comunicação quando há campanha ativa.

Exemplos de uso:

- aniversário da igreja;
- conferências;
- cultos temáticos;
- convites especiais.

### Quando usar

Usar `painel.jpeg` quando a igreja quiser destacar uma arte promocional no primeiro bloco do site.

### Quando não usar

Se não houver campanha ativa, o mais adequado é manter a imagem institucional padrão do site.

### Fluxo recomendado de atualização

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

### Comportamento das margens do painel em telas pequenas

A borda branca ao redor da imagem principal é calculada dinamicamente pelo navegador para se ajustar a qualquer tamanho de celular, garantindo que o painel sempre funcione como um quadro. O layout segue 4 regras funcionais estritas:

1. As **4 margens brancas** (superior, inferior, esquerda e direita) estarão sempre visíveis.
2. A borda mais estreita terá sempre o tamanho exato de **8px**, de modo que a imagem aproveite ao máximo o espaço sem encostar nos limites.
3. A margem direita será sempre igual à margem esquerda.
4. A margem superior será sempre igual à margem inferior.

Esse mecanismo garante que imagens com diferentes proporções (mais altas ou mais largas) não sofram cortes e permaneçam perfeitamente emolduradas de forma automática. O conjunto de testes automatizados valida constantemente essas 4 exigências matemáticas a cada alteração.

## 13. Segurança e manutenção

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

## 14. Evolução futura

Possíveis próximos passos do projeto:

- página própria para programação e agenda;
- área de ministérios;
- galeria de fotos;
- integração com redes sociais;
- formulário de contato;
- expansão futura para outros sites institucionais da igreja.

## 15. Licença e uso institucional

Salvo definição diferente da igreja, este projeto deve ser tratado como material institucional da **Igreja Aliança Cristã e Missionária do Paraíso**, com uso e manutenção controlados pela equipe responsável.
