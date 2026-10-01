const test = require("node:test");
const assert = require("node:assert/strict");
const Gamification = require("./gamification.js");

test("70% ou mais aprova", () => {
  assert.equal(Gamification.passesThreshold(7, 10), true);
  assert.equal(Gamification.passesThreshold(6, 10), false);
});
test("percentual e calculado de forma segura", () => {
  assert.equal(Gamification.scorePercent(2, 3), 67);
  assert.equal(Gamification.scorePercent(0, 0), 0);
});
test("avaliacoes finais de area mapeiam para medalhas", () => {
  assert.equal(Gamification.achievementForAssessment("aprender").label, "Medalha Aprender");
  assert.equal(Gamification.achievementForAssessment("kata-avancado").label, "Medalha Kata");
  assert.equal(Gamification.achievementForAssessment("kata-iniciante"), null);
});
test("trofeu e medalhas nao usam faixas de estudo", () => {
  assert.deepEqual(Object.keys(Gamification.MEDALS), ["aprender", "treinar", "kata"]);
  assert.equal(Gamification.TROPHY.label, "Troféu do Desafio Final");
});
