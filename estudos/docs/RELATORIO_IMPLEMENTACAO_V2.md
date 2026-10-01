# Relatório de Implementação — Jornada de Aprendizagem V2

**Data:** 05/09/2026  
**Produto:** Atarashii App  
**Stack preservada:** HTML, CSS, JavaScript vanilla, JSON, localStorage e PWA.

## Resumo executivo

O Atarashii App evoluiu de um guia digital com progressão por “Faixas de Estudos” para uma experiência estruturada de aprendizagem. A versão atual possui três trilhas independentes — Aprender, Treinar e Kata —, medalhas por área, dashboard com recomendação contextual e um Desafio Final em cinco rounds.

As três áreas estão disponíveis desde o início. As áreas institucionais A Atarashii e Contato permanecem fora do progresso. O sistema de faixas foi removido da experiência e substituído por medalhas e troféu, sem associação com a graduação oficial do Karate.

## Jornada final

```text
Aprender -> conteúdos -> avaliação >= 70% -> Medalha Aprender
Treinar  -> conteúdos -> avaliação >= 70% -> Medalha Treinar
Kata     -> Iniciante -> Intermediário -> Avançado -> Medalha Kata

3 medalhas -> Desafio Final / Dojo Challenge -> >= 70% -> Troféu
```

## Arquitetura

Módulos criados:

- `progress-service.js`: estado inicial, persistência, normalização, recuperação e migration;
- `learning-engine.js`: estados de conteúdo, abertura, conclusão, progresso, avaliações, níveis de Kata e recomendação;
- `assessment-engine.js`: cálculo de nota, histórico e concessão idempotente de medalhas;
- `challenge-engine.js`: seleção por rounds, validação dos tipos de interação, pontuação por área e troféu;
- `search-service.js`: normalização sem acentos, indexação de objetos aninhados e agrupamento por domínio;
- `gamification.js`: configuração simples de medalhas, troféu e limiar de aprovação.

`app.js` continua responsável pela composição e renderização da interface, mas as regras críticas não ficam mais nos templates.

Não foram adicionados framework, backend, banco, autenticação ou dependências externas.

## UX/UI

- Nova identidade de dashboard, preservando logo, vermelho, preto e branco.
- Hierarquia visual mais clara e menos aparência de coleção genérica de cards.
- Estados textuais para não iniciado, aberto, concluído e conteúdo em preparação.
- Botões desabilitados acompanhados de explicação.
- Foco visível, redução de movimento e controles nativos.
- Layout mobile-first sem overflow horizontal da página.
- Rolagem reiniciada ao trocar de rota.
- Componente visual reutilizável para medalha e troféu.

## Atualização da área Treinar

A área Treinar recebeu uma ficha pedagógica própria para as 16 técnicas e 15 bases. Cada item agora apresenta, além do resumo e do vídeo, tradução aproximada, o que é, para que serve, pontos técnicos, como praticar e erros comuns. A tela usa o mesmo padrão de detalhe da área Kata, com bloqueio da conclusão até a abertura do vídeo.

Os 31 vídeos enviados pelo responsável do projeto foram preservados exatamente, incluindo os links `/shorts/` e os dois links `/watch`. O conversor de mídia foi ampliado para incorporar os Shorts corretamente.

O conteúdo foi enriquecido a partir da terminologia da Japan Karate Association, do manual técnico de instrutores da JKA, do glossário da Shotokan Karate of America e do material de posições da Karate of Stanford. As fontes aparecem também no final de cada ficha de Treinar. O catálogo foi separado em `data/training-content.json`, permitindo revisão editorial independente dos dados legados.

## Home

A Home agora responde:

- onde o aluno está;
- o que já concluiu;
- qual conteúdo deve acessar em seguida;
- quais medalhas já conquistou;
- se o Desafio Final está bloqueado ou disponível.

A função `getRecommendedNextAction()` prioriza conteúdo aberto, conteúdo seguinte, avaliação disponível, área ainda não iniciada, Desafio Final e jornada concluída.

## Progresso

O schema atual é:

```text
schemaVersion: 2
curriculumVersion: 1
learningProgress: aprender | treinar | kata
assessments: aprender | treinar | kata por nível | finalChallenge
achievements: medals | trophy
preferences: favorites
```

Estados de item:

- `NOT_STARTED`;
- `OPENED`;
- `COMPLETED`;
- `CONTENT_PENDING`.

Itens pendentes permanecem visíveis, não podem ser concluídos e ficam fora do denominador.

## Migration

A migration automática lê o mesmo armazenamento legado `karate-shotokan-progress` e converte:

- IDs estudados para itens `COMPLETED`;
- sessões aprovadas para histórico de avaliação;
- Aprender e Treinar aprovados para medalhas correspondentes;
- as três avaliações antigas de Kata aprovadas para Medalha Kata;
- Desafio Final aprovado para troféu;
- favoritos antigos para o novo formato.

Uma conclusão antiga é preservada sem exigir abertura retroativa de mídia. A migration é idempotente e possui testes para repetição, dados parciais e estado corrompido.

## Medalhas

Conquistas implementadas:

- Medalha Aprender;
- Medalha Treinar;
- Medalha Kata;
- Troféu do Desafio Final.

Conteúdo completo libera avaliação. Resultado abaixo de 70% registra tentativa e não concede medalha. Resultado de 70% ou mais concede a conquista uma única vez.

## Kata

O catálogo oficial de runtime é `katas-shotokan-complete.json`, com 27 katas. O catálogo antigo de seis itens permanece identificado como legado.

A trilha obrigatória usa 26 katas:

- Iniciante: 5;
- Intermediário: 11;
- Avançado: 10.

Taikyoku Shodan permanece disponível como conteúdo adicional e não entra no denominador.

O Intermediário não expõe sua lista antes da aprovação no Iniciante. O Avançado segue a mesma regra em relação ao Intermediário. Todos os katas possuem vídeo e exigem sua abertura antes da conclusão.

## Desafio Final

O Dojo Challenge contém 15 desafios balanceados:

- 5 de Aprender;
- 5 de Treinar;
- 5 de Kata.

Distribuição em cinco rounds, com:

- múltipla escolha;
- verdadeiro ou falso;
- identificação por imagem;
- identificação por vídeo;
- associação de pares;
- ordenação.

Matching usa seletores adequados para toque, sem depender de drag-and-drop. Ordering usa botões de mover para cima/baixo. O resultado exibe percentual geral, desempenho por área e recomendação baseada na área mais fraca.

## Busca

A busca cobre conteúdos, glossário, regras, técnicas, bases e katas. Ela indexa objetos aninhados e pesquisa títulos, corpo, descrições, passos, observações, nomes japoneses e relacionamentos disponíveis.

A normalização ignora caixa, acentos e espaços repetidos. Os resultados aparecem agrupados por domínio e abrem diretamente o conteúdo.

## PWA

O service worker passou para cache `atarashii-app-v5` e inclui os novos módulos e o JSON do desafio. O precache usa tolerância individual a falhas, evitando que um único asset opcional impeça toda a instalação.

Os caminhos de precache são validados automaticamente e todos existem.

## Testes

Baseline antes da implementação:

- 9 testes executados;
- 9 aprovados;
- 0 falhas.

Resultado final:

- 34 testes executados;
- 34 aprovados;
- 0 falhas;
- 0 ignorados.

Cobertura funcional criada:

- estados e conclusão de conteúdo;
- regra obrigatória de mídia;
- `CONTENT_PENDING`;
- percentuais e áreas independentes;
- bloqueios sequenciais de Kata;
- medalhas e limiar de 70%;
- troféu e desbloqueio final;
- migration e idempotência;
- histórico de tentativas;
- tipos e pontuação do challenge;
- busca sem acentos e agrupamento;
- integridade dos JSONs;
- catálogo oficial de 27 katas;
- existência dos assets PWA;
- ordem dos módulos no HTML.

Comandos usados:

```bash
npm.cmd test
npm.cmd run check
git diff --check
```

O comando `npm` direto foi bloqueado pela política local de execução do PowerShell; `npm.cmd` executou normalmente.

## Validação visual

Validado no Chrome:

- dashboard desktop;
- dashboard em viewport representativo de smartphone;
- abertura e conclusão de texto;
- persistência após refresh;
- nível Intermediário de Kata bloqueado;
- vídeo obrigatório em Heian Shodan;
- mudança de `NOT_STARTED` para `OPENED` após abrir vídeo;
- busca por “rotacao” encontrando “Rotação”;
- ausência de overflow horizontal da página;
- ausência de erros e warnings do app em uma aba limpa.

O Desafio Final foi validado por testes automatizados de engine, tipos, rounds, pontuação, desempenho por área e troféu. Seu acesso visual permanece corretamente bloqueado em uma jornada nova até as três medalhas.

## Critérios de aceite

| Critério | Status | Evidência |
|---|---|---|
| CA01 Aprender disponível | Atendido | Card e navegação ativos desde o início |
| CA02 Treinar disponível | Atendido | Card e navegação ativos desde o início |
| CA03 Kata disponível | Atendido | Iniciante aberto desde o início |
| CA04 Progresso independente | Atendido | Estados separados e teste automatizado |
| CA05 Conteúdo acessado antes de concluir | Atendido | Learning engine e botão desabilitado |
| CA06 CONTENT_PENDING não bloqueia | Atendido | Fora do denominador, com teste |
| CA07 Avaliação por área | Atendido | Aprender, Treinar e avaliações internas de Kata |
| CA08 Aprovação >= 70% | Atendido | Engine e testes de limite |
| CA09 Medalha por área | Atendido | Três medalhas independentes |
| CA10 Remoção de Faixas de Estudos | Atendido | Interface e módulo sem faixas |
| CA11 Final bloqueado sem medalhas | Atendido | Regra por conquistas |
| CA12 Três medalhas liberam final | Atendido | Learning engine testada |
| CA13 Final mais rico que quiz | Atendido | Cinco rounds e seis tipos |
| CA14 Final >= 70% concede troféu | Atendido | Challenge engine testada |
| CA15 Home como dashboard | Atendido | Progresso, conquistas e cards |
| CA16 Próxima ação | Atendido | Recomendação centralizada |
| CA17 Busca multidomínio | Atendido | Seis domínios agrupados |
| CA18 Catálogo de 27 katas | Atendido | Validação automática |
| CA19 Kata sequencial | Atendido | Bloqueio visual e testes |
| CA20 Progresso antigo preservado | Atendido | Migration testada |
| CA21 Refresh preserva progresso | Atendido | Validado no navegador |
| CA22 Institucional fora da progressão | Atendido | Acessos separados |
| CA23 Mobile funcional | Atendido | Viewport 390x844 validado |
| CA24 PWA funcional | Atendido | SW v5 registrado, precache validado |
| CA25 Testes críticos passando | Atendido | 34/34 |

## Git

Principais grupos de alteração:

- aplicação: `prototype/app.js`, `prototype/index.html` e `prototype/styles.css`;
- domínio: cinco services/engines e `gamification.js`;
- dados: `data/final-challenge.json` e documentação da fonte oficial de Kata;
- PWA: `prototype/service-worker.js` e favicon raiz;
- testes: sete arquivos de teste;
- tooling: `package.json`;
- documentação: README, arquitetura, escopo, backlog, roadmap e este relatório.

Nenhum push, merge ou reescrita de histórico foi realizado.

## Pendências reais

- Muitos campos do catálogo de Kata ainda declaram necessidade de validação final pela Associação Atarashii. A implementação preserva esses avisos e não os substitui por conteúdo inventado.
- O conteúdo textual legado usa grafia sem acentos em vários registros. Isso não é mojibake nem impede uso, mas merece revisão editorial futura.
- O navegador usado na validação já continha progresso local; a migration preservou corretamente esse estado. Uma jornada completa manual até o troféu é longa por definição e foi coberta nesta entrega por testes automatizados das regras críticas.

## Dívida técnica

- A renderização permanece baseada em templates de string e listener global. É adequada ao MVP, mas telas futuras muito interativas podem justificar uma camada pequena de componentes DOM.
- `app.js` foi reduzido conceitualmente pela extração de domínio, mas ainda concentra composição visual e eventos.
- Não existe teste end-to-end automatizado instalado; a validação visual foi manual no navegador.

## Próximos passos

1. Validar textos, vídeos e sequência pedagógica dos 27 katas com a associação.
2. Fazer um teste acompanhado com 3 a 5 alunos em smartphone.
3. Criar um teste end-to-end leve para os fluxos essenciais, sem adicionar framework pesado.
4. Revisar editorialmente acentos e clareza dos conteúdos legados.
5. Publicar em ambiente de homologação e testar instalação/offline em aparelho real.
