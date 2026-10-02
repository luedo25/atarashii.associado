const test = require("node:test");
const assert = require("node:assert/strict");
const ProgressService = require("./progress-service.js");

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
  const invalid = ProgressService.migrate("{ruim", catalog);
  assert.equal(invalid.schemaVersion, 2);
  assert.deepEqual(invalid.achievements.medals, []);
});
test("serviço grava progresso por adaptador remoto sem usar Storage do navegador", async () => {
  const writes = [];
  const service = ProgressService.createRemote(null, catalog, async (state) => writes.push(state));
  service.update((state) => state.achievements.medals.push("aprender"));
  await service.flush();
  assert.equal(writes.length, 2);
  assert.equal(writes[1].schemaVersion, 2);
  assert.deepEqual(writes[1].achievements.medals, ["aprender"]);
});
test("tentativa de quiz pode ser reenviada depois de falha temporária da conexão", async () => {
  let calls = 0;
  const writes = [];
  const service = ProgressService.createRemote(ProgressService.initialState(), catalog, async (snapshot) => {
    calls += 1;
    if (calls === 1) throw new Error("rede indisponível");
    writes.push(snapshot);
  });
  service.update((state) => state.assessments["pilar-basico"].attempts.push({ score: 35, total: 40, percent: 88, passed: true }));
  await assert.rejects(service.flush(), /rede indisponível/);
  service.save();
  await service.flush();
  assert.equal(writes.length, 1);
  assert.equal(writes[0].assessments["pilar-basico"].attempts[0].percent, 88);
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
  const service = ProgressService.createRemote(null, catalog, async () => {});
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
