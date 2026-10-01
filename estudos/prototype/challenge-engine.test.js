const test = require("node:test");
const assert = require("node:assert/strict");
const ProgressService = require("./progress-service.js");
const Challenge = require("./challenge-engine.js");

const challenges = [
  { id: "a", round: 1, area: "aprender", correctAnswer: 0 },
  { id: "b", round: 1, area: "treinar", correctAnswer: { A: "B" } },
  { id: "c", round: 2, area: "kata", correctAnswer: ["1", "2"] },
];
test("sessao preserva rounds e desafios", () => {
  const session = Challenge.createSession(challenges, 4);
  assert.equal(session.length, 3);
  assert.deepEqual(session.map((item) => item.round), [1, 1, 2]);
});
test("valida respostas simples, matching e ordering", () => {
  assert.equal(Challenge.isCorrect(challenges[0], 0), true);
  assert.equal(Challenge.isCorrect(challenges[1], { A: "B" }), true);
  assert.equal(Challenge.isCorrect(challenges[2], ["1", "2"]), true);
});
test("resultado traz desempenho geral e por area", () => {
  const result = Challenge.summarize(challenges, [0, { A: "errado" }, ["1", "2"]]);
  assert.equal(result.percent, 67);
  assert.equal(result.areas.aprender.percent, 100);
  assert.equal(result.areas.treinar.percent, 0);
  assert.equal(result.areas.kata.percent, 100);
});
test("trofeu exige 70 e nao duplica", () => {
  const state = ProgressService.initialState();
  Challenge.recordResult(state, { percent: 60, passed: false, areas: {} }, "t1");
  assert.equal(state.achievements.trophy, null);
  Challenge.recordResult(state, { percent: 80, passed: true, areas: {} }, "t2");
  Challenge.recordResult(state, { percent: 90, passed: true, areas: {} }, "t3");
  assert.equal(state.achievements.trophy.earnedAt, "t2");
});
