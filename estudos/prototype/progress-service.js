(function (root) {
  "use strict";

  const STORAGE_KEY = "karate-shotokan-progress";
  const SCHEMA_VERSION = 2;
  const CURRICULUM_VERSION = 2;

  function initialState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      curriculumVersion: CURRICULUM_VERSION,
      learningProgress: {
        aprender: { items: {} },
        treinar: { items: {} },
        kata: { items: {} },
      },
      assessments: {
        aprender: { attempts: [], passed: false },
        treinar: { attempts: [], passed: false },
        "kata-iniciante": { attempts: [], passed: false },
        "kata-intermediario": { attempts: [], passed: false },
        "kata-avancado": { attempts: [], passed: false },
        "pilar-basico": { attempts: [], passed: false },
        "pilar-intermediario": { attempts: [], passed: false },
        "pilar-avancado": { attempts: [], passed: false },
        "pilar-especialista": { attempts: [], passed: false },
        finalChallenge: { attempts: [], passed: false },
      },
      achievements: { medals: [], trophy: null },
      preferences: { favorites: [] },
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function unique(values) {
    return [...new Set((values || []).filter(Boolean))];
  }

  function normalizeV2(value) {
    const base = initialState();
    if (!value || typeof value !== "object") return base;
    for (const area of ["aprender", "treinar", "kata"]) {
      const items = value.learningProgress?.[area]?.items;
      if (items && typeof items === "object" && !Array.isArray(items)) {
        base.learningProgress[area].items = clone(items);
      }
    }
    for (const key of Object.keys(base.assessments)) {
      const source = value.assessments?.[key];
      if (source && typeof source === "object") {
        const normalized = {
          attempts: Array.isArray(source.attempts) ? clone(source.attempts) : [],
          passed: Boolean(source.passed),
          ...(source.needsReread ? { needsReread: true } : {}),
        };
        if (Number.isFinite(source.bestPercent)) normalized.bestPercent = source.bestPercent;
        if (source.passedAt) normalized.passedAt = source.passedAt;
        base.assessments[key] = normalized;
      }
    }
    base.achievements.medals = unique(value.achievements?.medals);
    base.achievements.trophy = value.achievements?.trophy ? clone(value.achievements.trophy) : null;
    base.preferences.favorites = unique(value.preferences?.favorites);
    base.curriculumVersion = Number.isInteger(value.curriculumVersion) ? value.curriculumVersion : CURRICULUM_VERSION;
    return base;
  }

  function legacyAttempt(source) {
    if (!source || typeof source !== "object") return null;
    const total = Number(source.total) || 0;
    const score = Number(source.score) || 0;
    const percent = total ? Math.round((score / total) * 100) : 0;
    return {
      date: source.date || null,
      score,
      total,
      percent,
      passed: Boolean(source.completed || source.passed),
      migrated: true,
    };
  }

  function migrate(raw, catalog) {
    if (raw?.schemaVersion === SCHEMA_VERSION) {
      const next = normalizeV2(raw);
      const storedCurriculumVersion = Number.isInteger(raw.curriculumVersion) ? raw.curriculumVersion : 0;
      if (storedCurriculumVersion < CURRICULUM_VERSION) {
        next.learningProgress = initialState().learningProgress;
        for (const key of ["pilar-basico", "pilar-intermediario", "pilar-avancado", "pilar-especialista"]) {
          next.assessments[key] = { attempts: [], passed: false };
        }
        next.curriculumVersion = CURRICULUM_VERSION;
      }
      return next;
    }
    const next = initialState();
    if (!raw || typeof raw !== "object") return next;

    const byId = new Map((catalog || []).map((item) => [item.id, item]));
    for (const id of Array.isArray(raw.studied) ? raw.studied : []) {
      const item = byId.get(id);
      if (!item) continue;
      next.learningProgress[item.area].items[item.key] = {
        status: "COMPLETED",
        completedAt: null,
        migrated: true,
      };
    }

    const sessionMap = {
      aprender: "aprender",
      treinar: "treinar",
      "kata-iniciante": "kata-iniciante",
      "kata-intermediario": "kata-intermediario",
      "kata-avancado": "kata-avancado",
    };
    for (const [oldKey, newKey] of Object.entries(sessionMap)) {
      const attempt = legacyAttempt(raw.sessions?.[oldKey]);
      if (!attempt) continue;
      next.assessments[newKey].attempts.push(attempt);
      next.assessments[newKey].passed = attempt.passed;
      next.assessments[newKey].bestPercent = attempt.percent;
      if (attempt.passed && attempt.date) next.assessments[newKey].passedAt = attempt.date;
    }

    if (next.assessments.aprender.passed) next.achievements.medals.push("aprender");
    if (next.assessments.treinar.passed) next.achievements.medals.push("treinar");
    if (["kata-iniciante", "kata-intermediario", "kata-avancado"].every((key) => next.assessments[key].passed)) {
      next.achievements.medals.push("kata");
    }

    const finalAttempt = legacyAttempt(raw.finalChallenge || raw.quiz);
    if (finalAttempt) {
      next.assessments.finalChallenge.attempts.push(finalAttempt);
      next.assessments.finalChallenge.passed = finalAttempt.passed;
      next.assessments.finalChallenge.bestPercent = finalAttempt.percent;
      if (finalAttempt.passed) {
        next.assessments.finalChallenge.passedAt = finalAttempt.date;
        next.achievements.trophy = { earnedAt: finalAttempt.date, percent: finalAttempt.percent, migrated: true };
      }
    }
    next.achievements.medals = unique(next.achievements.medals);
    next.preferences.favorites = unique(raw.favorites);
    return next;
  }

  function create(storage, catalog, clock) {
    const now = clock || (() => new Date().toISOString());
    let state;
    try {
      const raw = JSON.parse(storage.getItem(STORAGE_KEY));
      state = migrate(raw, catalog);
    } catch {
      state = initialState();
    }

    function save() {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    }

    function getState() {
      return state;
    }

    function update(mutator) {
      mutator(state, now);
      return save();
    }

    function reset() {
      state = initialState();
      return save();
    }

    save();
    return { getState, save, update, reset, now };
  }

  function activateTestMode(progress, catalog, timestamp) {
    const now = timestamp || new Date().toISOString();
    for (const item of catalog || []) {
      if (!progress.learningProgress[item.area]) continue;
      progress.learningProgress[item.area].items[item.key] = {
        status: "COMPLETED", openedAt: now, mediaOpenedAt: item.mediaRequired ? now : null,
        completedAt: now, testMode: true,
      };
    }
    for (const key of Object.keys(progress.assessments)) {
      const attempts = progress.assessments[key].attempts || [];
      if (!attempts.some((attempt) => attempt.testMode)) {
        attempts.push({ date: now, score: 100, total: 100, percent: 100, passed: true, testMode: true });
      }
      progress.assessments[key] = { attempts, passed: true, bestPercent: 100, passedAt: now };
    }
    progress.achievements.medals = unique([...(progress.achievements.medals || []), "aprender", "treinar", "kata"]);
    progress.achievements.trophy = { earnedAt: now, percent: 100, testMode: true };
    return progress;
  }

  const api = { STORAGE_KEY, SCHEMA_VERSION, CURRICULUM_VERSION, initialState, normalizeV2, migrate, create, activateTestMode };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ProgressService = api;
})(typeof window !== "undefined" ? window : globalThis);
