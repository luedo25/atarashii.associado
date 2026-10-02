(function (root) {
  "use strict";

  const PASS_PERCENT = 70;

  function evaluate(questions, answers) {
    const score = questions.reduce((sum, question, index) => sum + (answers[index] === question.correctOption ? 1 : 0), 0);
    const total = questions.length;
    const percent = total ? Math.round((score / total) * 100) : 0;
    return { score, total, percent, passed: percent >= PASS_PERCENT };
  }

  function awardUnique(list, value) {
    if (!list.includes(value)) list.push(value);
  }

  function createPillarQuestions(pillarKey, subjects, pools, pillarIndex = 0, questionsPerSubject = 10) {
    return subjects.flatMap((subject) => {
      const pool = subject.key === "kata" ? pools.kataByPillar?.[pillarKey] : pools[subject.key];
      if (!Array.isArray(pool) || pool.length === 0) return [];
      return Array.from({ length: questionsPerSubject }, (_, index) => {
        const source = pool[(index + pillarIndex) % pool.length];
        return { ...source, id: `pilar-${pillarKey}-${subject.key}-${index + 1}`, category: subject.label };
      });
    });
  }

  function recordAttempt(state, assessmentKey, result, date) {
    const assessment = state.assessments[assessmentKey];
    const attempt = { ...result, date };
    assessment.attempts.push(attempt);
    assessment.bestPercent = Math.max(assessment.bestPercent || 0, result.percent);
    if (result.passed) {
      assessment.passed = true;
      assessment.passedAt ||= date;
      if (assessmentKey === "aprender" || assessmentKey === "treinar") awardUnique(state.achievements.medals, assessmentKey);
      if (assessmentKey === "kata-avancado") awardUnique(state.achievements.medals, "kata");
    }
    return attempt;
  }

  const api = { PASS_PERCENT, evaluate, recordAttempt, createPillarQuestions };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.AssessmentEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
