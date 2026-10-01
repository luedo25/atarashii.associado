const test = require("node:test");
const assert = require("node:assert/strict");
const ProgressService = require("./progress-service.js");
const Learning = require("./learning-engine.js");

const item = { id: "x", key: "tecnica:x", area: "treinar", required: true, pending: false, mediaRequired: true };
const textItem = { id: "y", key: "conteudo:y", area: "aprender", required: true, pending: false, mediaRequired: false };
const pending = { id: "z", key: "kata:z", area: "kata", level: "iniciante", required: true, pending: true, mediaRequired: false };

test("item com midia segue NOT_STARTED -> OPENED -> COMPLETED", () => {
  const state = ProgressService.initialState();
  assert.equal(Learning.getItemStatus(state, item), "NOT_STARTED");
  assert.equal(Learning.completeItem(state, item, "t1").reason, "MEDIA_REQUIRED");
  Learning.markItemOpened(state, item, "t1", "media");
  assert.equal(Learning.getItemStatus(state, item), "OPENED");
  assert.equal(Learning.completeItem(state, item, "t2").ok, true);
  assert.equal(Learning.getItemStatus(state, item), "COMPLETED");
});
test("conteudo textual precisa ser aberto antes da conclusao", () => {
  const state = ProgressService.initialState();
  assert.equal(Learning.completeItem(state, textItem, "t1").reason, "OPEN_REQUIRED");
  Learning.markItemOpened(state, textItem, "t1", "content");
  assert.equal(Learning.completeItem(state, textItem, "t2").ok, true);
});
test("CONTENT_PENDING nao pode concluir e sai do denominador", () => {
  const state = ProgressService.initialState();
  assert.equal(Learning.getItemStatus(state, pending), "CONTENT_PENDING");
  assert.equal(Learning.completeItem(state, pending, "t").reason, "CONTENT_PENDING");
  assert.deepEqual(Learning.calculateAreaProgress(state, [pending, { ...pending, ...textItem }], "aprender"), { completed: 0, total: 1, percent: 0 });
});
test("percentual considera somente itens obrigatorios disponiveis", () => {
  const state = ProgressService.initialState();
  const optional = { ...textItem, id: "o", key: "conteudo:o", required: false };
  Learning.markItemOpened(state, textItem, "t1", "content");
  Learning.completeItem(state, textItem, "t2");
  assert.deepEqual(Learning.calculateAreaProgress(state, [textItem, optional], "aprender"), { completed: 1, total: 1, percent: 100 });
});
test("niveis Kata desbloqueiam em sequencia", () => {
  const state = ProgressService.initialState();
  assert.equal(Learning.canAccessKataLevel(state, "iniciante"), true);
  assert.equal(Learning.canAccessKataLevel(state, "intermediario"), false);
  state.assessments["kata-iniciante"].passed = true;
  assert.equal(Learning.canAccessKataLevel(state, "intermediario"), true);
  assert.equal(Learning.canAccessKataLevel(state, "avancado"), false);
  state.assessments["kata-intermediario"].passed = true;
  assert.equal(Learning.canAccessKataLevel(state, "avancado"), true);
});
test("desafio final exige as tres medalhas", () => {
  const state = ProgressService.initialState();
  for (const medal of ["aprender", "treinar"]) state.achievements.medals.push(medal);
  assert.equal(Learning.canAccessFinalChallenge(state), false);
  state.achievements.medals.push("kata");
  assert.equal(Learning.canAccessFinalChallenge(state), true);
});
test("as tres areas iniciam independentes", () => {
  const state = ProgressService.initialState();
  const catalog = [
    { ...textItem },
    { ...item },
    { id: "k", key: "kata:k", area: "kata", level: "iniciante", required: true, pending: false, mediaRequired: false },
  ];
  assert.equal(Learning.canAccessKataLevel(state, "iniciante"), true);
  assert.equal(Learning.getItemStatus(state, catalog[0]), "NOT_STARTED");
  assert.equal(Learning.getItemStatus(state, catalog[1]), "NOT_STARTED");
  assert.equal(Learning.getItemStatus(state, catalog[2]), "NOT_STARTED");
});
test("avaliacao libera somente quando conteudo da propria area termina", () => {
  const state = ProgressService.initialState();
  const catalog = [textItem, item];
  Learning.markItemOpened(state, textItem, "t1", "content");
  Learning.completeItem(state, textItem, "t2");
  assert.equal(Learning.canTakeAssessment(state, catalog, "aprender"), true);
  assert.equal(Learning.canTakeAssessment(state, catalog, "treinar"), false);
});
