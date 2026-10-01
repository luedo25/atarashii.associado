const test = require("node:test");
const assert = require("node:assert/strict");
const ProgressService = require("./progress-service.js");
const Assessment = require("./assessment-engine.js");

const questions = [{ correctOption: 0 }, { correctOption: 1 }, { correctOption: 2 }];
test("avaliacao calcula nota e limiar", () => {
  assert.equal(Assessment.evaluate(questions, [0, 1, 2]).passed, true);
  assert.equal(Assessment.evaluate(questions, [0, 0, 0]).passed, false);
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
