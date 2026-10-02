const test = require("node:test");
const assert = require("node:assert/strict");
const ProgressService = require("./progress-service.js");
const Assessment = require("./assessment-engine.js");

const questions = [{ correctOption: 0 }, { correctOption: 1 }, { correctOption: 2 }];
test("avaliacao calcula nota e limiar", () => {
  assert.equal(Assessment.evaluate(questions, [0, 1, 2]).passed, true);
  assert.equal(Assessment.evaluate(questions, [0, 0, 0]).passed, false);
});
test("quiz do pilar básico usa somente perguntas de kata iniciante e mantém 10 por tema", () => {
  const subjects = [
    { key: "kata", label: "Kata" }, { key: "kihon", label: "Kihon" },
    { key: "kumite", label: "Kumite" }, { key: "geral", label: "Assuntos gerais" },
  ];
  const beginner = Array.from({ length: 10 }, (_, index) => ({ id: `beginner-${index}`, question: `Heian iniciante ${index}` }));
  const advanced = [{ id: "advanced", question: "Kanku Dai avançado" }];
  const pools = {
    kataByPillar: { basico: beginner, intermediario: advanced, avancado: advanced, especialista: advanced },
    kihon: [{ question: "Técnica básica" }], kumite: [{ question: "Regra" }], geral: [{ question: "Etiqueta do dojo" }],
  };
  const quiz = Assessment.createPillarQuestions("basico", subjects, pools, 0);
  assert.equal(quiz.length, 40);
  for (const subject of subjects) assert.equal(quiz.filter((question) => question.category === subject.label).length, 10);
  const kata = quiz.filter((question) => question.category === "Kata");
  assert.deepEqual(kata.map((question) => question.question), beginner.map((question) => question.question));
  assert.equal(kata.some((question) => question.question.includes("Kanku")), false);
});
test("resultado abaixo de 70 nao concede medalha", () => {
  const state = ProgressService.initialState();
  Assessment.recordAttempt(state, "aprender", { score: 1, total: 3, percent: 33, passed: false }, "t");
  assert.deepEqual(state.achievements.medals, []);
});
test("resultado aprovado concede medalha sem duplicar", () => {
  const state = ProgressService.initialState();
  const result = { score: 3, total: 3, percent: 100, passed: true };
  Assessment.recordAttempt(state, "aprender", result, "t1");
  Assessment.recordAttempt(state, "aprender", result, "t2");
  assert.deepEqual(state.achievements.medals, ["aprender"]);
  assert.equal(state.assessments.aprender.attempts.length, 2);
});
test("Kata concede medalha somente apos avaliacao avancada", () => {
  const state = ProgressService.initialState();
  const result = { score: 7, total: 10, percent: 70, passed: true };
  Assessment.recordAttempt(state, "kata-iniciante", result, "t1");
  Assessment.recordAttempt(state, "kata-intermediario", result, "t2");
  assert.deepEqual(state.achievements.medals, []);
  Assessment.recordAttempt(state, "kata-avancado", result, "t3");
  assert.deepEqual(state.achievements.medals, ["kata"]);
});
