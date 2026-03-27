# Igreja Aliança Cristã e Missionária do Paraíso

Site oficial da **Igreja Aliança Cristã e Missionária do Paraíso** (em construção).

---

## 1. Visão geral

O site da IACM Paraíso tem as seguintes características:

- **estático**, com carregamento rápido e baixo custo de hospedagem;
- **simples de publicar**, com suporte a GitHub Pages;
- **fácil de manter**, mesmo sem backend;
- **moderno e acolhedor**, com visual leve, alegre e respeitoso;
- **alinhado à identidade da igreja**, valorizando o logotipo, as cores institucionais e referências visuais discretas à cultura japonesa.

### Informações principais da igreja

**Culto:** todos os domingos às **17h00**  
**Local:** Associação da Província de Kagawa  
Rua Itaipu, 422  
(próximo da estação de metrô Praça da Árvore)  
Bairro Mirandópolis  
São Paulo - SP

---

## 2. Público deste documento

Este README é destinado a:

- equipe de comunicação da igreja;
- responsáveis por atualizar textos, fotos e horários;
- voluntários que publicam o site;
- mantenedores técnicos do repositório.

---

## 3. Estrutura do projeto

```text
.
├── index.html
├── assets/
│   ├── fachada-kagawa.jpeg
│   ├── iacm-logo.png
├── style.css
├── script.js
└── README.md
```

### Finalidade de cada parte

- `index.html`: página principal do site.
- `assets/`: imagens, ícones, logo e fotos institucionais.
- `style.css`: estilos visuais do site.
- `script.js`: interações visuais e animações leves.
- `README.md`: documentação principal do projeto.

---

## 5. Como executar localmente

Como o site é estático, é possível abrir o `index.html` diretamente no navegador.

---

## 6. Como atualizar o conteúdo

As mudanças mais comuns no site costumam ser estas:

### Atualizar horário ou endereço

Edite o conteúdo correspondente no arquivo principal da página, normalmente `index.html`.

Revise sempre:

- dia e horário do culto;
- endereço completo;
- referência de localização;
- link do mapa, quando existir.

### Atualizar imagens

Coloque os arquivos novos em `assets/` e substitua as referências no HTML, quando necessário.

Boas práticas:

- preferir imagens otimizadas para web;
- manter nomes de arquivo claros;
- evitar arquivos excessivamente pesados;
- preservar boa qualidade em fotos de fachada, eventos e logo.

### Atualizar redes sociais

Quando houver links para Instagram, Facebook, YouTube ou WhatsApp, revise se:

- o link está correto;
- o perfil ainda está ativo;
- o texto do botão corresponde ao destino real.

### Atualizar textos institucionais

Ao editar textos da igreja, manter:

- tom acolhedor;
- linguagem clara;
- reverência e simplicidade;
- consistência com a identidade da IACM Paraíso.

---

## 7. Diretrizes de conteúdo

### Identidade visual

O site deve valorizar:

- o **logo oficial** da igreja;
- cores harmonizadas com o logo;
- sensação de alegria, energia e acolhimento;
- efeitos visuais sutis, sem exagero;
- acessibilidade para público amplo e irrestrito.

### Referência cultural

É aceitável usar referências visuais discretas ligadas à cultura japonesa, desde que:

- não descaracterizem a identidade cristã da igreja;
- sejam elegantes e equilibradas;
- funcionem como apoio visual, e não como tema dominante.

### Linguagem recomendada

Evitar excesso de texto, linguagem técnica ou termos pouco naturais para visitantes novos.

---

## 8. Processo recomendado de publicação

### Fluxo básico

1. Fazer as alterações localmente.
2. Testar no navegador.
3. Revisar textos, links e imagens.
4. Confirmar se o site funciona bem em celular e desktop.
5. Publicar no repositório principal.
6. Validar a versão publicada no GitHub Pages.

### Checklist antes de publicar

Verificar:

- [ ] horário do culto correto;
- [ ] endereço correto;
- [ ] links externos funcionando;
- [ ] imagens carregando corretamente;
- [ ] logo em boa resolução;
- [ ] layout responsivo no celular;
- [ ] ausência de erros visíveis no JavaScript;
- [ ] grafia revisada em português.

---

## 9. Publicação no GitHub Pages

Como o site é estático, o fluxo de publicação costuma ser simples.

### Modelo recomendado

- manter o código em um repositório Git;
- usar a branch definida como principal de publicação;
- publicar via GitHub Pages;
- validar a URL final após cada atualização.

### Exemplo de fluxo com Git

```bash
git add .
git commit -m "Atualiza conteúdo do site"
git push
```

Depois disso, aguarde a atualização do GitHub Pages e revise a versão online.

> Em produção, a equipe deve considerar a branch publicada como ambiente oficial e evitar mudanças sem revisão mínima.

---

## 10. Boas práticas operacionais

### 10.1 Controle de mudanças

Sempre que possível:

- registrar o que foi alterado;
- usar mensagens de commit claras;
- evitar mudanças grandes sem teste prévio;
- publicar uma alteração por vez quando o prazo for apertado.

### 10.2 Gestão de imagens

- usar formatos apropriados para web;
- manter cópia original dos arquivos em local seguro;
- não sobrescrever acidentalmente o logo oficial sem backup;
- revisar direitos de uso de fotos antes de publicar.

### 10.3 Revisão de conteúdo

Antes de subir para produção, revisar:

- ortografia;
- nomes próprios;
- datas e horários;
- consistência ministerial;
- coerência visual.

### 10.4 Continuidade

Como boa prática institucional, recomenda-se que ao menos duas pessoas saibam:

- onde está o repositório;
- como publicar uma nova versão;
- como restaurar uma versão anterior.

---

## 11. Segurança e cuidados

Mesmo em um site estático, alguns cuidados são importantes:

- não publicar senhas no repositório;
- não expor chaves, tokens ou credenciais;
- revisar links externos antes de divulgar;
- evitar incorporar recursos de terceiros desnecessários;
- manter o conteúdo oficial sob controle da igreja.

Se houver formulários ou integrações no futuro, será necessário reforçar os cuidados de privacidade e segurança.

---

## 12. Responsividade e acessibilidade

O site deve permanecer legível e funcional em:

- celulares;
- tablets;
- notebooks;
- desktops.

Também é recomendado:

- bom contraste entre texto e fundo;
- tamanhos de fonte confortáveis;
- botões fáceis de tocar no celular;
- textos alternativos em imagens importantes, quando aplicável.

---

## 13. Evolução futura do projeto

Este site foi pensado para começar de forma estática, mas com base organizada para crescer.

Possíveis próximos passos:

- página própria para programação e agenda;
- área de ministérios;
- galeria de fotos;
- integração com Instagram;
- formulário de contato;
- versão futura para a **IACM Rudge Ramos**;
- empacotamento e publicação futura em infraestrutura conteinerizada mais avançada.

### Ambiente futuro

A preferência arquitetural definida para a evolução do projeto é:

- **desenvolvimento local com Docker Compose no Linux**;
- **publicação inicial estática em GitHub Pages**;
- possível **migração futura para Kubernetes** em ambiente de produção, caso o projeto cresça.

---

## 14. Conteúdos e referências institucionais

Fontes úteis já conhecidas para o projeto:

- Instagram da IACM Paraíso;
- Facebook histórico da igreja;
- materiais visuais institucionais;
- logo oficial da igreja;
- foto da fachada/local;
- referências de design de outras igrejas da Aliança.

Toda reutilização de mídia deve ser revisada com atenção à qualidade visual e adequação institucional.

---

## 15. Suporte de manutenção

Em caso de atualização, recomenda-se seguir esta ordem:

1. corrigir informações críticas primeiro;
2. revisar visual e funcionamento depois;
3. publicar somente após validação básica;
4. testar a versão online final.

Se algo quebrar após uma publicação:

1. voltar ao último commit estável;
2. republicar a versão anterior;
3. corrigir o problema localmente;
4. publicar novamente apenas após novo teste.

---

## 16. Resumo operacional rápido

Para a maioria das atualizações do dia a dia:

1. editar textos/imagens;
2. subir localmente com Docker Compose;
3. revisar no navegador;
4. fazer commit;
5. enviar ao repositório;
6. validar no GitHub Pages.

---

## 17. Licença e uso interno

Salvo definição diferente da igreja, este projeto deve ser tratado como material institucional da **Igreja Aliança Cristã e Missionária do Paraíso**, com uso e manutenção controlados pela equipe responsável.

---

## 18. Contato institucional sugerido no site

Sugere-se manter visíveis no site, sempre que disponíveis e validados:

- horário do Culto;
- endereço completo;
- mapa/localização;
- Instagram oficial;
- canal principal de contato.

---

Documento preparado para apoiar a operação do site da **IACM Paraíso** em ambiente de produção.
