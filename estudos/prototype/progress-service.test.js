const test = require("node:test");
const assert = require("node:assert/strict");
const ProgressService = require("./progress-service.js");

function storageWith(value) {
  let stored = value == null ? null : JSON.stringify(value);
  return { getItem: () => stored, setItem: (_, next) => { stored = next; }, value: () => stored };
}
const catalog = [
  { id: "c1", key: "conteudo:c1", area: "aprender" },
  { id: "t1", key: "tecnica:t1", area: "treinar" },
  { id: "k1", key: "kata:k1", area: "kata" },
];
const legacy = {
  studied: ["c1", "t1", "k1"], favorites: ["c1"],
  sessions: {
    aprender: { completed: true, score: 8, total: 10, date: "2025-01-01" },
    treinar: { completed: false, score: 6, total: 10, date: "2025-01-02" },
    "kata-iniciante": { completed: true, score: 4, total: 5 },
    "kata-intermediario": { completed: true, score: 8, total: 10 },
    "kata-avancado": { completed: true, score: 9, total: 10 },
  },
};

test("migration preserva conclusoes antigas sem exigir midia", () => {
  const next = ProgressService.migrate(legacy, catalog);
  assert.equal(next.learningProgress.aprender.items["conteudo:c1"].status, "COMPLETED");
  assert.equal(next.learningProgress.treinar.items["tecnica:t1"].status, "COMPLETED");
});
test("migration concede somente medalhas comprovadas", () => {
  const next = ProgressService.migrate(legacy, catalog);
  assert.deepEqual(next.achievements.medals.sort(), ["aprender", "kata"]);
});
test("migration repetida e idempotente", () => {
  const once = ProgressService.migrate(legacy, catalog);
  const twice = ProgressService.migrate(once, catalog);
  assert.deepEqual(twice, once);
});
test("estado corrompido recupera estado inicial", () => {
  const storage = { getItem: () => "{ruim", setItem: () => {} };
  const service = ProgressService.create(storage, catalog);
  assert.equal(service.getState().schemaVersion, 2);
  assert.deepEqual(service.getState().achievements.medals, []);
});
test("persistencia salva schema versionado", () => {
  const storage = storageWith(null);
  const service = ProgressService.create(storage, catalog);
  service.update((state) => state.achievements.medals.push("aprender"));
  assert.equal(JSON.parse(storage.value()).schemaVersion, 2);
  assert.deepEqual(JSON.parse(storage.value()).achievements.medals, ["aprender"]);
});
test("nova trilha exige releitura e aprovação mesmo para progresso da versão anterior", () => {
  const previous = ProgressService.initialState();
  previous.curriculumVersion = 1;
  previous.learningProgress.aprender.items["conteudo:c1"] = { status: "COMPLETED" };
  previous.assessments["pilar-basico"].passed = true;
  const migrated = ProgressService.migrate(previous, catalog);
  assert.equal(migrated.curriculumVersion, ProgressService.CURRICULUM_VERSION);
  assert.deepEqual(migrated.learningProgress.aprender.items, {});
  assert.equal(migrated.assessments["pilar-basico"].passed, false);
});
test("atalho de teste completa a jornada com 100 por cento", () => {
  const service = ProgressService.create(storageWith(null), catalog);
  const timestamp = "2026-09-05T20:00:00.000Z";
  service.update((state) => ProgressService.activateTestMode(state, catalog, timestamp));
  const state = service.getState();
  assert.deepEqual(state.achievements.medals.sort(), ["aprender", "kata", "treinar"]);
  assert.equal(state.achievements.trophy.percent, 100);
  assert.equal(state.achievements.trophy.testMode, true);
  for (const key of Object.keys(state.assessments)) assert.equal(state.assessments[key].bestPercent, 100);
  for (const area of ["aprender", "treinar", "kata"]) {
    for (const item of Object.values(state.learningProgress[area].items)) assert.equal(item.status, "COMPLETED");
  }
});
