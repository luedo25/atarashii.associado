# Proposta de Evolução da Gamificação — Atarashii App

**Data:** 05/09/2026  
**Objetivo:** melhorar a progressão de estudo do aluno, principalmente na área de Kata, substituindo a lógica de faixas por medalhas e tornando a conclusão mais significativa.

## 1. Direção recomendada

A gamificação deve funcionar como uma trilha de apoio ao estudo, e não como ranking, competição ou simulação da graduação oficial. O aluno deve perceber claramente:

1. o que precisa estudar;
2. o que já concluiu;
3. o que será liberado em seguida;
4. por que recebeu uma medalha;
5. quais pontos ainda precisa praticar com o sensei.

A recomendação é trocar “Faixas de Estudos” por **Medalhas de Aprendizado**. As medalhas representam conquistas dentro do app e nunca devem ser apresentadas como graduação de Karate.

## 2. Constatações da avaliação atual

Na execução do app pelo navegador, foram observados os seguintes comportamentos:

- A home inicia com 0% de progresso e mostra “Faixa de Estudos Branca”.
- O Kata é dividido em Iniciante, Intermediário e Avançado.
- Os três níveis aparecem desde o início.
- O nível Intermediário pode ser aberto mesmo quando está bloqueado para prova; o aluno consegue visualizar e abrir seus katas.
- O bloqueio atual impede a prova, mas não impede o acesso ao conteúdo.
- Um kata é concluído apenas pelo botão “Marcar como estudado”.
- O detalhe do kata exibe vídeo, mas abrir o vídeo não altera o estado de conclusão.
- O aluno precisa concluir todos os itens da sessão para liberar a prova.
- A prova exige 70%, e o fluxo atual usa a aprovação para avançar a progressão.
- O nível iniciante contém 5 katas, o intermediário 11 e o avançado 10; existe ainda Taikyoku Shodan fora da progressão.
- A navegação principal não exibe Consultar nem Revisar como áreas independentes.

O problema mais importante é de coerência: a interface informa que o aluno pode estudar qualquer nível, enquanto a necessidade do produto é uma progressão sequencial. A regra de desbloqueio precisa ser aplicada ao módulo visual, aos detalhes, às ações e às avaliações.

## 3. Novo modelo de progressão

### 3.1 Níveis de Kata

| Nível | Estado inicial | Critério para concluir | Desbloqueia |
|---|---|---|---|
| Kata Iniciante | Aberto | Todos os katas concluídos + mini-avaliação aprovada | Medalha Kata Iniciante e Intermediário |
| Kata Intermediário | Bloqueado | Todos os katas concluídos + mini-avaliação aprovada | Medalha Kata Intermediário e Avançado |
| Kata Avançado | Bloqueado | Todos os katas concluídos + mini-avaliação aprovada | Medalha Kata Avançado |

O conteúdo bloqueado pode aparecer como uma prévia educativa, com nome, quantidade de katas e explicação do requisito. Porém, não deve permitir abrir o detalhe completo nem marcar itens como concluídos antes do desbloqueio.

### 3.2 Regra de desbloqueio

```text
Iniciante aberto
  -> todos os katas iniciantes concluídos
  -> avaliação iniciante aprovada
  -> medalha Kata Iniciante
  -> Intermediário desbloqueado
  -> todos os katas intermediários concluídos
  -> avaliação intermediária aprovada
  -> medalha Kata Intermediário
  -> Avançado desbloqueado
```

A aprovação deve ser persistente. Uma tentativa reprovada não apaga os katas já estudados; o aluno apenas refaz a avaliação.

### 3.3 O que significa “concluir um kata”

Para marcar um kata como concluído, o aluno deve cumprir três etapas simples:

1. **Conhecer:** abrir o detalhe e ler a ficha do kata.
2. **Ver:** abrir o vídeo associado ao kata.
3. **Praticar:** confirmar que praticou ou revisou o kata, idealmente com orientação do sensei.

O app não deve fingir que consegue comprovar a execução física. A conclusão será uma confirmação do aluno, com linguagem honesta: “Marcar como estudado e praticado”.

### 3.4 Regra do vídeo

O requisito mínimo solicitado é que o aluno abra o vídeo do kata antes de concluir o item.

Fluxo recomendado:

- Se houver vídeo oficial: exibir o botão “Assistir vídeo do kata”.
- Ao clicar, registrar `videoOpenedAt` e habilitar o botão de conclusão.
- O botão de conclusão permanece desabilitado até o vídeo ser aberto.
- Depois de voltar ou fechar o vídeo, exibir “Agora marque como estudado e praticado”.
- Se não houver vídeo oficial: exibir “Este kata ainda não possui vídeo validado” e não bloquear o aluno indefinidamente. O item deve ficar como “conteúdo pendente”, fora do cálculo de conclusão, até que a associação cadastre a mídia.

Não é recomendável exigir que o app prove que o vídeo foi assistido até o fim. Links externos não permitem essa garantia de forma confiável e isso criaria fricção sem evidência pedagógica equivalente. Se futuramente houver necessidade, vídeos incorporados podem usar a API oficial do YouTube para detectar início e tempo mínimo, sempre com fallback manual.

## 4. Novo sistema de medalhas

### 4.1 Princípios

- Medalhas são marcos de aprendizado, não prêmios competitivos.
- Não haverá ranking, comparação pública, placar entre alunos ou punição por atraso.
- Cada medalha deve explicar o critério usado.
- O aluno pode rever o conteúdo mesmo depois de conquistar a medalha.
- A graduação real continua exclusivamente sob responsabilidade da associação e do sensei.

### 4.2 Medalhas propostas

| Medalha | Conquista |
|---|---|
| Primeiros Passos | Concluir o primeiro conteúdo do app |
| Fundamentos | Concluir a sessão Aprender |
| Base Sólida | Concluir a sessão Treinar |
| Kata Iniciante | Concluir todos os katas iniciantes e passar na avaliação |
| Kata Intermediário | Concluir todos os katas intermediários e passar na avaliação |
| Kata Avançado | Concluir todos os katas avançados e passar na avaliação |
| Olhar Atento | Abrir e revisar todos os vídeos disponíveis de um nível |
| Revisão | Concluir o desafio final de revisão |
| Caminho do Aluno | Concluir a trilha principal completa |

As medalhas podem ter três estados visuais: bloqueada, disponível e conquistada. Não é necessário criar bronze/prata/ouro neste primeiro momento; muitos níveis de prêmio podem desviar o foco do estudo. Se forem desejados no futuro, devem representar profundidade de aprendizagem, por exemplo: estudar, revisar e praticar com sensei — nunca velocidade.

### 4.3 Tela de progresso

Substituir a tela atual de faixas por um painel com:

- medalhas conquistadas;
- próxima medalha e requisito objetivo;
- progresso por área;
- níveis de Kata desbloqueados;
- katas concluídos, pendentes e sem vídeo validado;
- resultados das avaliações;
- botão “Continuar estudando”.

Exemplo de mensagem:

> Você concluiu 3 de 5 katas iniciantes. Falta revisar Heian Sandan e Tekki Shodan. Depois da avaliação, o nível Intermediário será liberado.

## 5. Experiência proposta para a área Kata

### 5.1 Hub de Kata

O hub deve mostrar três cartões em sequência:

- **Iniciante — Aberto**: “5 katas · 0/5 concluídos”.
- **Intermediário — Bloqueado**: “Conclua o nível Iniciante para liberar”.
- **Avançado — Bloqueado**: “Conclua o nível Intermediário para liberar”.

O cartão bloqueado pode ser tocado para explicar o requisito, mas não deve levar à lista aberta de detalhes.

### 5.2 Lista de nível

Cada cartão de kata deve exibir:

- nome e significado;
- nível e dificuldade;
- indicador de vídeo disponível;
- estado: não iniciado, vídeo aberto, concluído ou pendente de validação;
- progresso do nível: `3/5 concluídos`.

### 5.3 Detalhe do kata

Ordem recomendada da tela:

1. nome, significado e resumo;
2. vídeo oficial;
3. informações técnicas;
4. checklist de aprendizagem;
5. erros comuns;
6. ação de conclusão;
7. kata anterior/próximo.

Estados da ação principal:

- “Assistir vídeo para habilitar conclusão”;
- “Vídeo aberto — marcar como estudado e praticado”;
- “Kata concluído”;
- “Vídeo oficial pendente de cadastro”.

## 6. Modelo de dados e estado recomendado

O estado atual usa arrays simples de IDs. Para a nova lógica, recomenda-se evoluir sem quebrar o progresso existente:

```json
{
  "version": 2,
  "items": {
    "kata:heian-shodan": {
      "status": "completed",
      "videoOpenedAt": "2026-09-05T12:00:00.000Z",
      "completedAt": "2026-09-05T12:05:00.000Z"
    }
  },
  "levels": {
    "kata-iniciante": {
      "status": "completed",
      "score": 8,
      "total": 10,
      "completedAt": "2026-09-05T12:10:00.000Z"
    }
  },
  "medals": {
    "kata-iniciante": {
      "earnedAt": "2026-09-05T12:10:00.000Z"
    }
  }
}
```

Estados de item sugeridos:

- `not_started`;
- `video_opened`;
- `completed`;
- `content_pending`.

O ID composto por tipo e identificador (`kata:heian-shodan`) evita colisões entre conteúdo, técnica, regra e termo.

## 7. Ajustes técnicos necessários

### Prioridade 0 — regra correta

- Aplicar o bloqueio de nível antes de renderizar a lista de katas.
- Impedir conclusão de kata sem registro de abertura do vídeo.
- Diferenciar conteúdo bloqueado, item sem vídeo e item concluído.
- Migrar a tela de progresso de faixas para medalhas.
- Atualizar textos da home e remover a linguagem de graduação, exceto no aviso sobre graduação oficial.

### Prioridade 1 — estrutura sustentável

- Extrair um serviço de progresso/gamificação de `app.js`.
- Criar funções puras para `isLevelUnlocked`, `isKataCompletable`, `completeKata`, `awardMedal` e `levelProgress`.
- Versionar o `localStorage` e migrar dados antigos de `studied`, `sessions` e `finalChallenge`.
- Centralizar a configuração de níveis, critérios e medalhas em um objeto de domínio.
- Adicionar testes unitários para bloqueios, vídeo, conclusão, repetição de avaliação e concessão idempotente de medalhas.

### Prioridade 2 — experiência e confiança

- Mostrar claramente os requisitos antes de bloquear uma ação.
- Incluir opção de “revisar novamente” sem alterar a conclusão.
- Permitir reset consciente do progresso apenas em uma área de configurações, com confirmação.
- Incluir “validado pela associação”/fonte quando aplicável.
- Corrigir acessibilidade e foco quando uma etapa for liberada.

## 8. Critérios de aceite da nova gamificação

- O nível Intermediário não permite abrir a lista completa antes da conclusão do Iniciante.
- O nível Avançado não permite abrir a lista completa antes da conclusão do Intermediário.
- Um kata com vídeo não pode ser concluído antes de o aluno acionar “Assistir vídeo”.
- Um kata sem vídeo validado aparece como pendente e não bloqueia a trilha por erro editorial.
- Concluir o mesmo kata duas vezes não duplica progresso nem medalha.
- Uma reprovação na avaliação não apaga os katas concluídos.
- A avaliação aprovada libera o próximo nível uma única vez.
- A tela de progresso mostra medalhas e requisitos, sem apresentar medalha como graduação oficial.
- O aluno consegue continuar estudando itens já concluídos.
- O progresso permanece após recarregar o navegador.
- O fluxo funciona em celular e desktop.

## 9. Plano de implementação por etapas

### Etapa 1 — domínio

Implementar o novo modelo de progresso, regras de bloqueio e medalhas com testes, sem alterar ainda todo o visual.

### Etapa 2 — Kata

Corrigir o hub, bloquear níveis, atualizar cards e criar o estado de vídeo aberto/conclusão.

### Etapa 3 — progresso

Substituir faixas por medalhas e exibir a próxima ação recomendada.

### Etapa 4 — qualidade pedagógica

Revisar textos, critérios, vídeos e conteúdos com a associação; tratar katas sem mídia validada.

### Etapa 5 — validação com alunos

Observar alguns alunos iniciantes usando o fluxo sem instrução adicional. Medir onde hesitam, não apenas se conseguem clicar. Ajustar linguagem, quantidade de etapas e clareza dos requisitos.

## 10. Decisão recomendada

Adotar uma gamificação leve, sequencial e transparente:

**estudar → abrir vídeo → praticar → marcar conclusão → fazer avaliação → ganhar medalha → liberar próximo nível.**

Essa estrutura reforça o hábito de estudo e o contato com o material visual, sem criar a falsa impressão de que o app certifica o aluno. Para este projeto, que será um apoio aos alunos da associação, a qualidade da orientação, a clareza dos próximos passos e a possibilidade de rever o conteúdo são mais importantes do que quantidade de pontos, ranking ou recompensas chamativas.
