(function (root) {
  "use strict";

  function stableShuffle(values, seed) {
    const copy = [...values];
    let state = seed || Date.now();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      state = (state * 1664525 + 1013904223) % 4294967296;
      const target = Math.floor((state / 4294967296) * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function createSession(challenges, seed) {
    const rounds = [...new Set(challenges.map((item) => item.round))].sort((a, b) => a - b);
    return rounds.flatMap((round) => stableShuffle(challenges.filter((item) => item.round === round), (seed || 1) + round));
  }

  function normalizeAnswer(value) {
    if (Array.isArray(value)) return JSON.stringify(value.map(String));
    if (value && typeof value === "object") return JSON.stringify(Object.keys(value).sort().map((key) => [key, String(value[key])]));
    return String(value);
  }

  function isCorrect(challenge, answer) {
    return normalizeAnswer(answer) === normalizeAnswer(challenge.correctAnswer);
  }

  function summarize(challenges, answers) {
    const areas = { aprender: { score: 0, total: 0 }, treinar: { score: 0, total: 0 }, kata: { score: 0, total: 0 } };
    let score = 0;
    challenges.forEach((challenge, index) => {
      const correct = isCorrect(challenge, answers[index]);
      areas[challenge.area].total += 1;
      if (correct) {
        score += 1;
        areas[challenge.area].score += 1;
      }
    });
    for (const area of Object.values(areas)) area.percent = area.total ? Math.round((area.score / area.total) * 100) : 0;
    const total = challenges.length;
    const percent = total ? Math.round((score / total) * 100) : 0;
    return { score, total, percent, passed: percent >= 70, areas };
  }

  function recordResult(state, result, date) {
    const target = state.assessments.finalChallenge;
    target.attempts.push({ ...result, date });
    target.bestPercent = Math.max(target.bestPercent || 0, result.percent);
    if (result.passed) {
      target.passed = true;
      target.passedAt ||= date;
      state.achievements.trophy ||= { earnedAt: date, percent: result.percent };
    }
  }

  const api = { stableShuffle, createSession, isCorrect, summarize, recordResult };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ChallengeEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
