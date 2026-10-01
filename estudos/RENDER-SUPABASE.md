# Persistência do progresso de Estudos

O guia usa a sessão autenticada do Área do Associado. O progresso não é guardado no Storage do navegador: o cliente chama a API Render e o servidor grava o estado JSON por aluno no Supabase, usando a conexão `DATABASE_URL` já existente.

## O que foi integrado

- `api-render/server.js` agora contém `GET /api/estudos/progresso` e `PUT /api/estudos/progresso`.
- Ambas as rotas exigem o Bearer token já usado pela Área do Associado e aceitam somente alunos.
- A API escolhe o aluno pela sessão validada no servidor; o navegador não pode escolher nem alterar a identidade da linha.
- A tabela `public.estudos_progresso` é criada na inicialização do servidor e também está descrita em `database/estudos_progresso.sql` para instalação ou conferência manual.
- O acesso ao banco continua no backend via `DATABASE_URL`. Nenhuma chave do Supabase é enviada ao navegador.

## Publicação

O diretório `api-render/` contém o projeto Node.js do serviço que roda no Render. Para manter o repositório único, configure o serviço Web Service existente para usar `api-render` como **Root Directory**. Os comandos continuam sendo `npm install` e `npm start`, e as variáveis atuais `DATABASE_URL`, `JWT_SECRET` e as demais configurações do serviço devem permanecer definidas no Render.

Na próxima inicialização, o servidor cria a tabela se ela ainda não existir. Também é possível executar o SQL de `database/estudos_progresso.sql` no Supabase antes do deploy. O banco configurado em `DATABASE_URL` deve permitir que o papel da API crie tabelas (na primeira inicialização) ou que a tabela tenha sido criada previamente.

## Contrato das rotas

- `GET /api/estudos/progresso` responde `{ "progresso": <estado JSON ou null>, "atualizado_em": <data ou null> }`.
- `PUT /api/estudos/progresso` recebe `{ "progresso": <estado JSON> }` e responde `{ "ok": true, "atualizado_em": <data> }`.

A identidade persistida vem exclusivamente de `req.usuario.usuario`, preenchida após validar a sessão e consultar o cadastro ativo do aluno.
