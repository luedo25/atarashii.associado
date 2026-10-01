(function (root) {
  "use strict";

  const PASS_THRESHOLD = 0.7;
  const MEDALS = {
    aprender: { icon: "🥇", label: "Medalha Aprender" },
    treinar: { icon: "🥇", label: "Medalha Treinar" },
    kata: { icon: "🥇", label: "Medalha Kata" },
  };
  const TROPHY = { icon: "🏆", label: "Troféu do Desafio Final" };

  function scorePercent(correctCount, total) {
    return total ? Math.round((correctCount / total) * 100) : 0;
  }

  function passesThreshold(correctCount, total) {
    return total > 0 && correctCount / total >= PASS_THRESHOLD;
  }

  function achievementForAssessment(key) {
    if (key === "aprender" || key === "treinar") return MEDALS[key];
    if (key === "kata-avancado") return MEDALS.kata;
    return null;
  }

  const api = { PASS_THRESHOLD, MEDALS, TROPHY, scorePercent, passesThreshold, achievementForAssessment };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Gamification = api;
})(typeof window !== "undefined" ? window : globalThis);
