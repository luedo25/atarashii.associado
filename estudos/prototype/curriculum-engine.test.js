const test = require("node:test");
const assert = require("node:assert/strict");
const Curriculum = require("./curriculum-engine.js");

const pillars = ["basico", "intermediario", "avancado", "especialista"].map((key) => ({ key }));
test("somente o pilar basico fica disponivel no inicio", () => {
  const assessments = {};
  assert.equal(Curriculum.canAccessPillar("basico", pillars, assessments), true);
  for (const key of ["intermediario", "avancado", "especialista"]) {
    assert.equal(Curriculum.canAccessPillar(key, pillars, assessments), false);
  }
});
test("cada aprovacao libera somente a etapa seguinte", () => {
  const assessments = { "pilar-basico": { passed: true } };
  assert.equal(Curriculum.canAccessPillar("intermediario", pillars, assessments), true);
  assert.equal(Curriculum.canAccessPillar("avancado", pillars, assessments), false);
  assessments["pilar-intermediario"] = { passed: true };
  assert.equal(Curriculum.canAccessPillar("avancado", pillars, assessments), true);
  assert.equal(Curriculum.canAccessPillar("especialista", pillars, assessments), false);
  assessments["pilar-avancado"] = { passed: true };
  assert.equal(Curriculum.canAccessPillar("especialista", pillars, assessments), true);
});
test("reprovar nao libera o proximo pilar e desconhecidos ficam bloqueados", () => {
  assert.equal(Curriculum.canAccessPillar("intermediario", pillars, { "pilar-basico": { passed: false } }), false);
  assert.equal(Curriculum.canAccessPillar("outro", pillars, {}), false);
});
test("katas ficam no pilar do nível em que o aluno vai estudá-los", () => {
  assert.equal(Curriculum.pillarForKataLevel("iniciante"), "basico");
  assert.equal(Curriculum.pillarForKataLevel("intermediario"), "intermediario");
  assert.equal(Curriculum.pillarForKataLevel("avancado"), "avancado");
});
