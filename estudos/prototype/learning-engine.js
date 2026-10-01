(function (root) {
  "use strict";

  const STATUS = {
    NOT_STARTED: "NOT_STARTED",
    OPENED: "OPENED",
    COMPLETED: "COMPLETED",
    CONTENT_PENDING: "CONTENT_PENDING",
  };

  function recordFor(state, item) {
    return state.learningProgress[item.area].items[item.key];
  }

  function getItemStatus(state, item) {
    if (item.pending) return STATUS.CONTENT_PENDING;
    return recordFor(state, item)?.status || STATUS.NOT_STARTED;
  }

  function markItemOpened(state, item, date, interaction) {
    if (item.pending) return { ok: false, reason: "CONTENT_PENDING" };
    const current = recordFor(state, item) || {};
    if (current.status === STATUS.COMPLETED) return { ok: true, unchanged: true };
    state.learningProgress[item.area].items[item.key] = {
      ...current,
      status: STATUS.OPENED,
      openedAt: current.openedAt || date,
      mediaOpenedAt: interaction === "media" ? current.mediaOpenedAt || date : current.mediaOpenedAt,
    };
    return { ok: true };
  }

  function canCompleteItem(state, item) {
    if (item.pending) return false;
    const record = recordFor(state, item);
    if (record?.status === STATUS.COMPLETED) return true;
    if (record?.status !== STATUS.OPENED) return false;
    return !item.mediaRequired || Boolean(record.mediaOpenedAt);
  }

  function completeItem(state, item, date) {
    if (!canCompleteItem(state, item)) {
      return { ok: false, reason: item.pending ? "CONTENT_PENDING" : item.mediaRequired ? "MEDIA_REQUIRED" : "OPEN_REQUIRED" };
    }
    const current = recordFor(state, item) || {};
    state.learningProgress[item.area].items[item.key] = {
      ...current,
      status: STATUS.COMPLETED,
      completedAt: current.completedAt || date,
    };
    return { ok: true };
  }

  function eligibleItems(catalog, area, level) {
    return catalog.filter((item) => item.area === area && item.required !== false && !item.pending && (!level || item.level === level));
  }

  function calculateAreaProgress(state, catalog, area, level) {
    const items = eligibleItems(catalog, area, level);
    const completed = items.filter((item) => getItemStatus(state, item) === STATUS.COMPLETED).length;
    return { completed, total: items.length, percent: items.length ? Math.round((completed / items.length) * 100) : 0 };
  }

  function isAreaContentComplete(state, catalog, area, level) {
    const progress = calculateAreaProgress(state, catalog, area, level);
    return progress.total > 0 && progress.completed === progress.total;
  }

  function canTakeAssessment(state, catalog, assessmentKey) {
    if (assessmentKey === "aprender" || assessmentKey === "treinar") {
      return isAreaContentComplete(state, catalog, assessmentKey);
    }
    if (assessmentKey.startsWith("kata-")) {
      const level = assessmentKey.replace("kata-", "");
      return canAccessKataLevel(state, level) && isAreaContentComplete(state, catalog, "kata", level);
    }
    return false;
  }

  function canAccessKataLevel(state, level) {
    if (level === "iniciante") return true;
    if (level === "intermediario") return Boolean(state.assessments["kata-iniciante"]?.passed);
    if (level === "avancado") return Boolean(state.assessments["kata-intermediario"]?.passed);
    return true;
  }

  function hasEarnedMedal(state, medal) {
    return state.achievements.medals.includes(medal);
  }

  function canAccessFinalChallenge(state) {
    return ["aprender", "treinar", "kata"].every((medal) => hasEarnedMedal(state, medal));
  }

  function getRecommendedNextAction(state, catalog) {
    const available = catalog.filter((item) => item.required !== false && !item.pending && (item.area !== "kata" || canAccessKataLevel(state, item.level)));
    const opened = available.find((item) => getItemStatus(state, item) === STATUS.OPENED);
    if (opened) return { label: `Continue ${opened.title}`, route: `detail:${opened.kind}:${opened.id}` };

    for (const area of ["aprender", "treinar", "kata"]) {
      const assessmentKeys = area === "kata" ? ["kata-iniciante", "kata-intermediario", "kata-avancado"] : [area];
      for (const key of assessmentKeys) {
        if (canTakeAssessment(state, catalog, key) && !state.assessments[key].passed) {
          return { label: `Faça a Avaliação ${key.startsWith("kata-") ? `Kata ${key.replace("kata-", "")}` : area}`, route: `assessment:${key}` };
        }
      }
      const next = available.find((item) => item.area === area && getItemStatus(state, item) === STATUS.NOT_STARTED);
      if (next) return { label: `Estude ${next.title}`, route: `detail:${next.kind}:${next.id}` };
    }
    if (canAccessFinalChallenge(state) && !state.achievements.trophy) return { label: "Entre no Desafio Final", route: "desafio-final" };
    if (state.achievements.trophy) return { label: "Reveja suas conquistas", route: "progresso" };
    return { label: "Veja seu progresso", route: "progresso" };
  }

  const api = { STATUS, getItemStatus, markItemOpened, canCompleteItem, completeItem, calculateAreaProgress, isAreaContentComplete, canTakeAssessment, canAccessKataLevel, hasEarnedMedal, canAccessFinalChallenge, getRecommendedNextAction };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LearningEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
