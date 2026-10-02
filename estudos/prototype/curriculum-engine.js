(function (root) {
  "use strict";

  function canAccessPillar(pillarKey, pillars, assessments) {
    const index = pillars.findIndex((pillar) => pillar.key === pillarKey);
    if (index < 0) return false;
    return pillars.slice(0, index).every((pillar) => assessments[`pilar-${pillar.key}`]?.passed === true);
  }

  function prerequisiteFor(pillarKey, pillars) {
    const index = pillars.findIndex((pillar) => pillar.key === pillarKey);
    return index > 0 ? pillars[index - 1] : null;
  }

  function pillarForKataLevel(level) {
    return ({ iniciante: "basico", intermediario: "intermediario", avancado: "avancado" })[level] || "especialista";
  }

  const api = { canAccessPillar, prerequisiteFor, pillarForKataLevel };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CurriculumEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
