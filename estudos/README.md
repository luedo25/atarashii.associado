# Atarashii App

Projeto de aplicativo educativo e consultivo sobre Karate Shotokan da Associacao Atarashii Karate-do Shotokan.

O foco inicial e criar uma primeira versao simples para alunos iniciantes, usando a apostila como base de conteudo. O produto deve evoluir por fases ate atender alunos de todos os niveis, instrutores e uma futura area de Sensei Online com IA.

O Atarashii App e um web app (navegador). Nao ha mais planos de aplicativo nativo Android/iOS.

## Documentos Do Projeto

- [Diretriz do Produto](docs/DIRETRIZ_DO_PRODUTO.md)
- [Roadmap](docs/ROADMAP.md)
- [Escopo do MVP](docs/ESCOPO_MVP.md)
- [Mapa de Telas](docs/MAPA_DE_TELAS.md)
- [Arquitetura do Produto](docs/ARQUITETURA_DO_PRODUTO.md)
- [Backlog Tecnico do MVP](docs/BACKLOG_TECNICO_MVP.md)
- [Evolucao de Midia em Treino](docs/EVOLUCAO_MIDIA_TREINO.md)
- [Dados do MVP](data/README.md)
- [Análise completa do projeto](docs/ANALISE_COMPLETA_PROJETO.md)
- [Proposta de evolução da gamificação](docs/PROPOSTA_EVOLUCAO_GAMIFICACAO.md)
- [Relatório de implementação da Jornada V2](docs/RELATORIO_IMPLEMENTACAO_V2.md)

## Web App

- [App navegavel](prototype/index.html)

## Marca

- Nome do app: Atarashii App
- Logo: [Atarashii](assets/brand/atarashii-logo.png)

## Direcao Atual

O guia de estudo é dividido em quatro pilares: Básico, Intermediário, Avançado e Especialista. Cada pilar organiza o conteúdo em Kata, Kihon, Kumite e assuntos gerais. O aluno conclui todas as leituras antes de liberar o quiz de 40 questões, com 10 perguntas por tema e nota mínima de 70%.

Cada pilar permite três tentativas. Após três reprovações, todo o conteúdo daquele pilar precisa ser lido novamente antes da liberação de uma nova série de tentativas.

## Integração com a Área do Associado

O guia é servido dentro do mesmo domínio e usa a sessão autenticada e o PWA principal do site. O progresso é enviado à API autenticada do Render, que o persiste no Supabase; ele não é guardado no Storage do navegador. O servidor e suas rotas de progresso estão incluídos em `../api-render/`; veja [RENDER-SUPABASE.md](RENDER-SUPABASE.md) para configurar o serviço Render.

## Versão 2 — Jornada de Aprendizagem

O app agora organiza a experiência em três trilhas independentes:

- Aprender;
- Treinar;
- Kata, com progressão sequencial entre Iniciante, Intermediário e Avançado.

Cada trilha concede uma medalha após a conclusão dos conteúdos e aprovação com pelo menos 70%. As três medalhas desbloqueiam o Desafio Final, uma experiência em cinco rounds que concede o Troféu da Jornada.

As antigas Faixas de Estudos foram removidas da experiência. Medalhas e troféu representam apenas o aprendizado dentro do aplicativo, não a graduação oficial do aluno.

## Desenvolvimento local

Requisitos: Node.js para testes e Python para o servidor estático.

```bash
npm test
npm run check
npm run serve
```

Depois, abra `http://localhost:8765`.
