# Panorama Geral do Projeto — Atarashii App

**Data da análise:** 05/09/2026  
**Escopo:** análise do produto, da implementação frontend e da arquitetura existente, com base nos arquivos presentes no repositório.  
**Perspectivas utilizadas:** Product Owner, engenharia/frontend e arquitetura de software.

## 1. Resumo executivo

O Atarashii App é um web app educativo e consultivo sobre Karate Shotokan, voltado inicialmente para alunos iniciantes. O objetivo é transformar o conteúdo da apostila em uma experiência de estudo mais organizada, com consulta de fundamentos, técnicas, bases, katas, glossário, regras, quiz e progresso.

O produto implementado hoje é um protótipo funcional em HTML, CSS e JavaScript puro, servido diretamente como arquivos estáticos. Ele carrega conteúdo de JSON, usa imagens locais, grava progresso no `localStorage` e possui elementos de PWA (manifest e service worker). Não há backend, autenticação, banco de dados, framework frontend, bundler, package manager ou pipeline de build configurado.

A base é adequada para validar a proposta e os fluxos iniciais. O principal risco é a distância entre a arquitetura planejada e a estrutura efetivamente entregue: quase toda a interface e a lógica de domínio estão concentradas em um `app.js` de aproximadamente 45 KB, a navegação planejada não está integralmente exposta e existem modelos de dados legados/paralelos para katas.

**Conclusão:** o projeto está em condição de protótipo/MVP demonstrável, mas ainda não em uma base ideal para uma sequência grande de requisitos. Antes de adicionar muitos módulos, recomenda-se estabilizar contratos de dados, navegação, testes e a separação entre domínio, estado e apresentação.

## 2. Produto e objetivo — visão de PO

### 2.1 Problema que o produto resolve

O aluno precisa estudar e consultar conteúdos do Karate Shotokan sem depender de percorrer uma apostila longa. O app funciona como guia de estudo, consulta rápida e revisão, sempre como complemento ao treino presencial e à orientação do sensei.

### 2.2 Público

- **Público inicial:** aluno iniciante.
- **Públicos futuros:** alunos intermediários e avançados, competidores, instrutores, academias e responsáveis por crianças.
- **Expansões previstas:** trilhas por faixa, biblioteca visual, área da associação/instrutor e Sensei Online baseado em conteúdo validado.

### 2.3 Proposta de valor atual

Organizar conhecimento de Karate em quatro intenções principais: aprender conceitos, treinar fundamentos, consultar referências e revisar por quiz. A gamificação adicionada transforma sessões de estudo em uma progressão de “Faixas de Estudos”, sem afirmar que substitui a graduação oficial.

### 2.4 Conteúdo e volume identificado

| Domínio | Fonte ativa | Volume observado |
|---|---|---:|
| Conteúdos conceituais | `data/content-items.json` | 17 |
| Glossário | `data/glossary.json` | 25 |
| Técnicas | `data/techniques.json` | 16 |
| Bases | `data/stances.json` | 15 |
| Katas ativos | `data/katas-shotokan-complete.json` | 27 |
| Regras | `data/rules.json` | 11 |
| Quiz geral | `data/quiz.json` | 50 |
| Quiz de kata | 3 arquivos | 26 no total |

### 2.5 Fluxo de progressão implementado

1. O aluno estuda itens de uma sessão.
2. Marca todos os itens da sessão como estudados.
3. Faz a mini-prova da sessão.
4. Precisa atingir 70% para concluí-la.
5. A conclusão libera a próxima sessão/faixa.
6. Depois das cinco sessões, o desafio final usa o quiz geral e representa a Faixa de Estudos Preta.

Sessões configuradas: `aprender`, `treinar`, `kata-iniciante`, `kata-intermediario` e `kata-avancado`.

### 2.6 Pontos fortes de produto

- Objetivo e público inicial estão bem definidos.
- O escopo inicial evita login e IA antes da validação do produto.
- O conteúdo está separado por domínio e preparado para campos opcionais de vídeo, checklist e notas de instrutor.
- A progressão deixa explícita a separação entre gamificação e graduação real.
- O roadmap identifica evoluções plausíveis: vídeos oficiais, Kihon, Katas, instrutor e IA.
- A identidade da associação e os canais de contato já aparecem no produto.

### 2.7 Pontos fracos e decisões de produto pendentes

- Não está definido qual é a métrica de sucesso do MVP: conclusão de trilha, frequência, aprovação no quiz, retorno semanal ou validação por alunos.
- O papel de “Revisar” mudou de quiz geral para desafio final, mas isso reduz a capacidade de revisão livre prevista no escopo original.
- O usuário não tem perfil, faixa real, sincronização ou recuperação de progresso; tudo depende do navegador atual.
- Há um link de “App do Aluno” ainda configurado como placeholder em `prototype/app.js`.
- O catálogo ativo de 27 katas excede o escopo inicial de seis katas; isso precisa ser assumido como decisão oficial ou reduzido/segmentado.
- Não há critérios de governança editorial: quem valida técnica, correção histórica, regras, vídeos e fontes antes da publicação.

## 3. Frontend e UX — visão de agente frontend

### 3.1 Tecnologia e composição

- HTML semântico básico em `prototype/index.html`.
- CSS responsivo em `prototype/styles.css`, com variáveis de cor e breakpoints.
- JavaScript vanilla em `prototype/app.js`.
- Módulo isolado de gamificação em `prototype/gamification.js`.
- JSONs consumidos via `fetch` a partir de `../data`.
- `localStorage` para itens estudados, favoritos e resultados.
- Manifest PWA e service worker com estratégia network-first.
- Sem React/Vue/Svelte, TypeScript, testes de UI, lint, build ou dependências declaradas.

### 3.2 Arquitetura de interface observada

O app é uma SPA simples baseada em estado local e renderização por `innerHTML`. As “rotas” são strings internas como `home`, `aprender`, `treinar`, `katas`, `quiz`, `resultado` e `progresso`. Um listener global de clique interpreta atributos `data-route`, `data-action`, `data-open`, `data-filter` e `data-answer`.

Isso torna o protótipo rápido de alterar, porém sem URL real, deep link, histórico do navegador ou separação formal de componentes. Re-renderizar o `main` inteiro após quase toda ação também torna a interface mais difícil de evoluir para estados complexos.

### 3.3 Pontos fortes frontend/UX

- Abordagem mobile-first, com navegação inferior no celular e barra adaptada no desktop.
- Layout visual consistente com a marca: vermelho, preto, branco e neutros quentes.
- Uso de `alt`, `aria-label`, `aria-live` e botões nativos em vários pontos.
- Responsividade simples e legível, com cards, filtros, detalhes, barra de progresso e mídia incorporada.
- Escape de valores dinâmicos com `htmlEscape` antes de inseri-los em HTML.
- Tratamento de carregamento e erro ao carregar dados.
- Imagens locais e fallback para campos de vídeo ausentes.

### 3.4 Problemas frontend/UX encontrados

1. **Navegação incompleta:** a barra principal exibe Home, Aprender, Treinar, Kata e A Atarashii. Consultar não aparece como área própria e Revisar também não; ambas existem como conceitos/rotas internas, mas não como navegação principal consistente.
2. **Rota `consultar` incompleta:** `render()` prevê a rota, mas `sectionView("consultar")` não possui título nem montagem de itens para essa área. Se acionada, pode falhar ao desestruturar `titles[area]`.
3. **Histórico de navegação ausente:** as rotas não são refletidas na URL e o botão Voltar é estado interno; refresh perde a tela atual.
4. **Acessibilidade parcial:** há atributos úteis, mas faltam foco visível/gerenciamento de foco em mudança de tela, estados ARIA para seleção, feedback mais claro de erro e testes com teclado/leitor de tela.
5. **Busca limitada:** pesquisa apenas alguns campos e faz comparação simples em lowercase; não cobre corpo completo, passos, observações, fontes ou normalização de acentos.
6. **Estado de progresso frágil:** não há versionamento do schema, data de atualização por item, migração, exportação/importação ou proteção contra corrupção do `localStorage` durante gravação.
7. **PWA incompleto:** o cache lista assets específicos, mas não há estratégia clara de atualização, fallback de navegação ou precache automatizado de novas imagens adicionadas.
8. **Encoding inconsistente:** vários textos exibidos no código aparecem com mojibake (`LuÃ­s`, `â€”`, etc.), indicando arquivos ou fluxo de encoding que precisam ser normalizados para UTF-8.

## 4. Arquitetura e engenharia — visão de arquiteto

### 4.1 Arquitetura atual

```text
index.html (redirect)
  -> prototype/index.html
      -> app.js + gamification.js
      -> fetch ../data/*.json
      -> imagens em ../assets/*
      -> localStorage do navegador
      -> service-worker.js / manifest.json
```

Não há servidor de aplicação. O deploy pode ser feito em hospedagem estática, mas o app precisa ser servido por HTTP(S): abrir diretamente via `file://` não funciona de forma confiável por causa do `fetch` dos JSONs.

### 4.2 Pontos fortes arquiteturais

- Conteúdo e assets estão fora do JavaScript de renderização.
- Os dados usam IDs estáveis e vários modelos já preveem relacionamento futuro.
- O módulo de gamificação foi separado e possui testes unitários.
- A persistência local não mistura o conteúdo dos JSONs com o progresso.
- A solução tem baixo custo operacional e baixa barreira para publicar uma primeira versão.
- A arquitetura documentada evita acoplar prematuramente login, IA e banco de dados.

### 4.3 Pontos fracos arquiteturais

- `app.js` concentra estado, carregamento, regras de domínio, roteamento, templates e eventos; é o principal ponto de acoplamento.
- A arquitetura documentada fala em camadas, mas o código ainda não materializa módulos de Conteúdo, Aprendizado, Revisão e Usuário.
- Não existe contrato/schema validado para JSON nem validação no carregamento.
- Existem dois catálogos de kata: `katas.json` (seis itens) e `katas-shotokan-complete.json` (27 itens). O app usa somente o segundo.
- `katas.json` e `stances.json` começam com BOM UTF-8; parsers estritos Node falham sem remoção do BOM. Isso já foi detectado em validação local.
- Não há testes de integração para carregamento, busca, progresso, renderização ou fluxo de quiz.
- Não há CI, lint, formatter, auditoria de links/assets ou comando documentado de execução.
- O deploy estático limita recursos futuros que exigem usuário, autorização, edição de conteúdo, analytics ou IA.
- O service worker usa uma lista manual de assets e pode falhar na instalação se qualquer caminho precacheado estiver indisponível.
- O modelo de progresso usa arrays de IDs, sem `itemType`, `itemId`, `status` e `updatedAt` conforme previsto na arquitetura futura.

### 4.4 Segurança e robustez

- Os valores de conteúdo passam por escape na maioria dos templates; manter essa regra é essencial caso os JSONs passem a ser editáveis por terceiros.
- Links externos usam `target="_blank"` com `rel="noreferrer"`, o que é positivo.
- Não há backend nem dados sensíveis no momento.
- O placeholder de URL do aluno deve ser bloqueado no processo de publicação.
- URLs de vídeo deveriam ser validadas por provedor/allowlist antes de virar iframe.
- O HTML gerado via templates deve continuar proibindo conteúdo HTML bruto vindo dos JSONs, ou adotar sanitização explícita.

## 5. Divergências entre intenção e implementação

| Tema | Planejado/documentado | Implementado | Impacto |
|---|---|---|---|
| Áreas principais | Aprender, Treinar, Consultar, Revisar | Consultar não está funcional; Revisar virou desafio final | Alto: muda a jornada esperada |
| Katas do MVP | Seis katas iniciais | Catálogo completo com 27 katas e três tiers | Médio: altera escopo e progressão |
| Estrutura modular | Camadas/domínios preparados para crescer | Um `app.js` central | Alto para próximos requisitos |
| Busca global | Encontrar termos, katas, técnicas e regras | Busca simples por campos resumidos | Médio |
| Progresso futuro | Modelo com tipo, item, status e data | Arrays de IDs e objetos de sessão | Médio/alto para login e sincronização |
| Execução | README e ambiente de desenvolvimento | Não há `package.json` nem comando de dev | Médio: onboarding e automação prejudicados |
| Testes | Critérios de qualidade do MVP | 9 testes unitários só para gamificação | Alto: regressões de UI passam despercebidas |
| Conteúdo | Conteúdo validado e rastreável | Alguns arquivos têm fontes, outros não | Alto em contexto educacional |

## 6. Backlog técnico recomendado antes de uma grande expansão

### P0 — estabilização

- Definir uma única fonte oficial para katas e remover/arquivar o catálogo duplicado.
- Normalizar todos os arquivos para UTF-8 sem BOM indevido e corrigir textos corrompidos.
- Implementar corretamente as áreas Consultar e Revisar conforme a decisão de produto.
- Substituir o placeholder do App do Aluno ou ocultar a ação até haver URL válida.
- Criar validação de schema para todos os JSONs e uma checagem de links/assets.
- Adicionar `package.json` mínimo com comandos de teste, validação e servidor local.
- Registrar testes dos fluxos principais: carregar app, abrir detalhe, marcar estudo, buscar, iniciar/finalizar quiz e persistir progresso.

### P1 — base para novos requisitos

- Separar `data service`, `progress service`, `gamification`, `router`, `views/templates` e componentes de UI.
- Definir um modelo de conteúdo comum: `id`, `type`, `title`, `summary`, `body`, `level`, `media`, `source`, `relatedIds`.
- Versionar o progresso local e preparar migração para o formato `{ itemType, itemId, status, updatedAt }`.
- Adicionar URL/history API ou migrar para um roteador leve, preservando deep links.
- Criar uma camada de configuração para links, identidade e ambiente.
- Formalizar a estratégia de cache e atualização do PWA.

### P2 — evolução de produto

- Perfil opcional e sincronização multi-dispositivo.
- CMS ou painel editorial quando a frequência de edição justificar.
- Trilhas por faixa real e por faixa de estudos, com regras de desbloqueio configuráveis.
- Biblioteca de vídeos/GIFs com metadados, direitos de uso e fallback.
- Analytics de aprendizado com atenção à privacidade.
- Sensei Online separado da UI e apoiado apenas por conteúdo validado.

## 7. Perguntas que devem orientar os novos requisitos

- O produto seguirá como site estático ou haverá necessidade de login, backend e painel administrativo?
- A faixa exibida é apenas gamificação ou deverá refletir a graduação oficial do aluno?
- O catálogo completo de katas já é parte do produto oficial?
- “Consultar” e “Revisar” devem ser áreas de navegação independentes?
- Conteúdo será editado por desenvolvedores ou por instrutores sem alterar código?
- Vídeos e GIFs serão apenas links externos ou haverá mídia hospedada pela associação?
- É necessário uso offline real e sincronização posterior?
- Quais métricas definirão que o MVP está funcionando?
- Qual é o processo de validação pedagógica e técnica antes de publicar conteúdo?

## 8. Arquivos de referência

- [README do projeto](../README.md)
- [Diretriz do produto](DIRETRIZ_DO_PRODUTO.md)
- [Escopo do MVP](ESCOPO_MVP.md)
- [Mapa de telas](MAPA_DE_TELAS.md)
- [Arquitetura do produto](ARQUITETURA_DO_PRODUTO.md)
- [Backlog técnico](BACKLOG_TECNICO_MVP.md)
- [Roadmap](ROADMAP.md)
- [Implementação frontend](../prototype/app.js)
- [Módulo de gamificação](../prototype/gamification.js)
- [Testes existentes](../prototype/gamification.test.js)

## 9. Parecer final

O Atarashii App tem uma visão de produto coerente e uma prova de conceito funcional, com bons fundamentos para conteúdo estático, responsividade, progressão e futura expansão. O investimento mais importante agora não é adicionar telas isoladas, mas reduzir o acoplamento e alinhar a implementação ao contrato de produto já documentado.

Para receber uma série de requisitos novos com segurança, a ordem recomendada é: **alinhar decisões de produto → consolidar dados → corrigir navegação existente → criar testes e comandos de qualidade → modularizar o frontend → implementar os novos módulos por fatias verticais**.
