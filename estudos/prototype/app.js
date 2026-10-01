"use strict";

const state = {
  data: null, catalog: [], progressService: null, route: "home", returnRoute: "home",
  currentUser: null,
  filter: "todos", search: "", assessment: null, assessmentResult: null,
  challenge: null, challengeResult: null, achievement: null, notice: "",
};

const app = document.querySelector("#app");
const tabs = [...document.querySelectorAll(".tab")];
const dataFiles = {
  contents: "../data/content-items.json", techniques: "../data/techniques.json",
  stances: "../data/stances.json", katas: "../data/katas-shotokan-complete.json",
  glossary: "../data/glossary.json", rules: "../data/rules.json", quiz: "../data/quiz.json",
  quizKataIniciante: "../data/quiz-kata-iniciante.json",
  quizKataIntermediario: "../data/quiz-kata-intermediario.json",
  quizKataAvancado: "../data/quiz-kata-avancado.json",
  finalChallenge: "../data/final-challenge.json", trainingContent: "../data/training-content.json",
};
const AREA_LABELS = { aprender: "Aprender", treinar: "Treinar", kata: "Kata" };
const PILLARS = [
  { key: "basico", label: "Básico", icon: "一", description: "Fundamentos para iniciar o caminho no Karate." },
  { key: "intermediario", label: "Intermediário", icon: "二", description: "Amplie a técnica, a compreensão e a prática." },
  { key: "avancado", label: "Avançado", icon: "三", description: "Aprofunde execução, estratégia e aplicações." },
  { key: "especialista", label: "Especialista", icon: "四", description: "Integre os conhecimentos e refine sua prática." },
];
const SUBJECTS = [
  { key: "kata", label: "Kata", icon: "型" },
  { key: "kihon", label: "Kihon", icon: "技" },
  { key: "kumite", label: "Kumite", icon: "組" },
  { key: "geral", label: "Assuntos gerais", icon: "道" },
];
const PILLAR_LABEL = Object.fromEntries(PILLARS.map((pillar) => [pillar.key, pillar.label]));
const SUBJECT_LABEL = Object.fromEntries(SUBJECTS.map((subject) => [subject.key, subject.label]));
const pillarAssessmentKey = (pillar) => `pilar-${pillar}`;
const ASSESSMENT_LABELS = {
  aprender: "Avaliação Aprender", treinar: "Avaliação Treinar",
  "kata-iniciante": "Avaliação Kata Iniciante",
  "kata-intermediario": "Avaliação Kata Intermediário",
  "kata-avancado": "Avaliação Kata Avançado",
};
const STATUS_LABELS = {
  NOT_STARTED: "Não iniciado", OPENED: "Aberto",
  COMPLETED: "Concluído", CONTENT_PENDING: "Conteúdo em preparação",
};
const contactInfo = {
  place: "Academia Bee Strong",
  address: "R. Alm. Luís Penido Burnier, 211 - Jardim Sandra, São Paulo - SP",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.%20Alm.%20Lu%C3%ADs%20Penido%20Burnier%2C%20211%20-%20Jardim%20Sandra%2C%20S%C3%A3o%20Paulo%20-%20SP",
  instagramUrl: "https://www.instagram.com/associacao_atarashii_karate/",
  whatsappNumber: "5511965512234",
};

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function asArray(value) { return Array.isArray(value) ? value : value == null || value === "" ? [] : [value]; }
function youtubeEmbedUrl(url) {
  try {
    const parsed = new URL(url);
    let id = parsed.hostname.includes("youtu.be") ? parsed.pathname.slice(1) : parsed.searchParams.get("v");
    if (!id && parsed.pathname.includes("/shorts/")) id = parsed.pathname.split("/shorts/")[1].split("/")[0];
    if (!id && parsed.pathname.includes("/embed/")) id = parsed.pathname.split("/embed/")[1];
    return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : "";
  } catch { return ""; }
}
function mediaFor(raw, kind) {
  if (kind === "kata") {
    const url = raw.video?.youtube_video_url || raw.associationVideoUrl || raw.videoUrl;
    return url ? { type: "video", url } : null;
  }
  const video = raw.associationVideoUrl || raw.videoUrl;
  if (video) return { type: "video", url: video };
  const image = raw.gifUrl || raw.imageUrl || raw.diagramUrl;
  return image ? { type: "image", url: image } : null;
}
function makeItem(raw, config) {
  const title = raw.title || raw.name || raw.term || raw.nome;
  const media = mediaFor(raw, config.kind);
  return {
    ...config, id: raw.id, key: `${config.kind}:${raw.id}`, title,
    summary: raw.summary || raw.description || raw.meaning || raw.significado || "",
    raw, media, mediaRequired: Boolean(media),
    pending: Boolean(config.mediaExpected && !media), required: config.required !== false,
    searchData: raw,
  };
}
function buildCatalog(data) {
  const techniqueProfiles = data.trainingContent?.techniques || {};
  const stanceProfiles = data.trainingContent?.stances || {};
  return [
    ...data.contents.map((raw) => makeItem(raw, { area: "aprender", kind: "conteudo", domain: "Conteúdos" })),
    ...data.glossary.map((raw) => makeItem(raw, { area: "aprender", kind: "termo", domain: "Glossário" })),
    ...data.rules.map((raw) => makeItem(raw, { area: "aprender", kind: "regra", domain: "Regras" })),
    ...data.techniques.map((raw) => makeItem({ ...raw, ...(techniqueProfiles[raw.id] || {}) }, { area: "treinar", kind: "tecnica", domain: "Técnicas", mediaExpected: true })),
    ...data.stances.map((raw) => makeItem({ ...raw, ...(stanceProfiles[raw.id] || {}) }, { area: "treinar", kind: "base", domain: "Bases", mediaExpected: true })),
    ...data.katas.map((raw) => makeItem(raw, {
      area: "kata", kind: "kata", domain: "Katas", level: raw.nivelJogo || "extra",
      required: Boolean(raw.nivelJogo), mediaExpected: true,
    })),
  ];
}
async function loadData() {
  const currentUser = await Auth.exigirSessao("aluno");
  if (!currentUser) return false;
  state.currentUser = currentUser;
  const studentName = document.querySelector("#studentName");
  if (studentName) studentName.textContent = `Olá, ${currentUser.nome || currentUser.usuario || "Associado"}`;
  const entries = await Promise.all(Object.entries(dataFiles).map(async ([key, path]) => {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Falha ao carregar ${path}: ${response.status}`);
    return [key, await response.json()];
  }));
  state.data = Object.fromEntries(entries);
  state.data.katas = Array.isArray(state.data.katas) ? state.data.katas : state.data.katas.katas;
  state.catalog = buildCatalog(state.data);
  assignCurriculum(state.catalog);
  const remote = await EstudosProgresso.obter();
  state.progressService = ProgressService.createRemote(remote?.progresso || null, state.catalog, (progress) => EstudosProgresso.salvar(progress));
  return true;
}
function subjectForItem(item) {
  if (item.kind === "kata") return "kata";
  if (item.kind === "tecnica" || item.kind === "base") return "kihon";
  if (item.kind === "regra") return item.raw.modality === "Kata" ? "kata" : "kumite";
  return "geral";
}
function assignCurriculum(catalog) {
  for (const subject of SUBJECTS) {
    const items = catalog.filter((item) => item.required !== false && !item.pending && subjectForItem(item) === subject.key);
    items.forEach((item, index) => {
      item.subject = subject.key;
      item.pillar = PILLARS[Math.min(3, Math.floor(index * 4 / Math.max(items.length, 1)))].key;
    });
  }
  catalog.filter((item) => item.required === false || item.pending).forEach((item) => {
    item.subject = subjectForItem(item);
    item.pillar = "especialista";
  });
}
function pillarItems(pillar, subject) {
  return state.catalog.filter((item) => item.pillar === pillar && item.subject === subject && item.required !== false && !item.pending);
}
function pillarProgress(pillar) {
  const items = state.catalog.filter((item) => item.pillar === pillar && item.required !== false && !item.pending);
  const completed = items.filter((item) => itemStatus(item) === "COMPLETED").length;
  return { total: items.length, completed, percent: items.length ? Math.round(completed * 100 / items.length) : 0 };
}
function pillarAssessmentState(pillar) {
  return progressState().assessments[pillarAssessmentKey(pillar)];
}
function canAccessPillar(pillar) {
  return CurriculumEngine.canAccessPillar(pillar, PILLARS, progressState().assessments);
}
function pillarPrerequisite(pillar) {
  return CurriculumEngine.prerequisiteFor(pillar, PILLARS);
}
function pillarCanQuiz(pillar) {
  const record = pillarAssessmentState(pillar);
  const p = pillarProgress(pillar);
  const allRead = p.total > 0 && p.completed === p.total;
  return allRead && (!record?.passed) && (!record?.needsReread || allRead);
}
function progressState() { return state.progressService.getState(); }
function findItem(kind, id) { return state.catalog.find((item) => item.kind === kind && item.id === id); }
function itemByKey(key) { return state.catalog.find((item) => item.key === key); }
function itemStatus(item) { return LearningEngine.getItemStatus(progressState(), item); }
function routeTo(route) {
  state.route = route; state.filter = "todos"; state.notice = "";
  const hash = `#${route}`;
  if (location.hash !== hash) history.pushState(null, "", hash);
  render();
  window.scrollTo({ top: 0, behavior: "auto" });
}
function openDetail(kind, id) {
  const item = findItem(kind, id);
  if (!item) return;
  if (!canAccessPillar(item.pillar)) {
    routeTo(`pilar:${item.pillar}`);
    return;
  }
  if (!state.route.startsWith("detail:")) state.returnRoute = state.route;
  if (!item.mediaRequired && !item.pending) {
    state.progressService.update((progress, now) => LearningEngine.markItemOpened(progress, item, now(), "content"));
  }
  routeTo(`detail:${kind}:${id}`);
}
function statusBadge(item) {
  const status = itemStatus(item);
  return `<span class="status status--${status.toLowerCase()}">${escapeHtml(STATUS_LABELS[status])}</span>`;
}
function progressBar(progress, label) {
  return `<div class="progress-row"><div class="progress-row__copy"><span>${escapeHtml(label)}</span><strong>${progress.completed}/${progress.total} · ${progress.percent}%</strong></div><div class="progress-track" role="progressbar" aria-label="${escapeHtml(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress.percent}"><span class="progress-fill" style="width:${progress.percent}%"></span></div></div>`;
}
function medalState(area) {
  const earned = LearningEngine.hasEarnedMedal(progressState(), area);
  return `<span class="achievement-pill ${earned ? "is-earned" : ""}">${earned ? "🥇" : "○"} ${escapeHtml(AREA_LABELS[area])}</span>`;
}
function currentKataLevelLabel() {
  if (LearningEngine.canAccessKataLevel(progressState(), "avancado")) return "Avançado";
  if (LearningEngine.canAccessKataLevel(progressState(), "intermediario")) return "Intermediário";
  return "Iniciante";
}
function dashboardCard(area, description, route) {
  const progress = LearningEngine.calculateAreaProgress(progressState(), state.catalog, area);
  const medal = LearningEngine.hasEarnedMedal(progressState(), area);
  const icon = area === "aprender" ? "学" : area === "treinar" ? "技" : "型";
  const extra = area === "kata" ? `<span>Nível atual: ${currentKataLevelLabel()}</span>` : "";
  return `<button class="journey-card journey-card--${area}" data-route="${route}" type="button"><span class="journey-card__top"><span class="journey-icon">${icon}</span>${medal ? '<span class="medal-mark">🥇</span>' : ""}</span><strong>${AREA_LABELS[area]}</strong><span>${escapeHtml(description)}</span><span>${progress.completed} de ${progress.total} concluídos · ${progress.percent}%</span>${extra}</button>`;
}
function homeView() {
  const progress = progressState();
  const incomplete = PILLARS.find((pillar) => pillarProgress(pillar.key).percent < 100 || !pillarAssessmentState(pillar.key).passed);
  return `
    <section class="dashboard">
      <header class="dashboard-hero"><div><p class="eyebrow">Guia de estudo · Karate Shotokan</p><h2>Aprenda em quatro pilares</h2><p>Estude todo o conteúdo de Kata, Kihon, Kumite e assuntos gerais em cada etapa. Ao concluir as leituras, faça o quiz obrigatório de 40 perguntas.</p></div><img src="../assets/brand/atarashii-logo.png" alt="Logo Atarashii Karate-do Shotokan" /></header>
      <section class="next-action"><div><p class="eyebrow">Sua próxima etapa</p><h3>${incomplete ? `Pilar ${PILLAR_LABEL[incomplete.key]}` : "Jornada concluída"}</h3><p>Quatro temas · 40 questões · mínimo de 70% para aprovação</p></div><button class="primary-button" data-route="${incomplete ? `pilar:${incomplete.key}` : "progresso"}" type="button">${incomplete ? "Continuar" : "Ver progresso"}</button></section>
      <section class="pillar-grid" aria-label="Pilares de estudo">${PILLARS.map((pillar, index) => {
        const p = pillarProgress(pillar.key), exam = pillarAssessmentState(pillar.key);
        const unlocked = canAccessPillar(pillar.key), prerequisite = pillarPrerequisite(pillar.key);
        return `<button class="pillar-card ${unlocked ? "" : "is-locked"}" data-route="pilar:${pillar.key}" type="button"><span class="pillar-card__top"><span>${pillar.icon}</span><small>${unlocked ? `0${index + 1}` : "🔒"}</small></span><strong>${pillar.label}</strong><span>${pillar.description}</span><span class="pillar-card__progress">${p.completed}/${p.total} conteúdos · ${p.percent}%</span><span class="pillar-card__status">${exam.passed ? "✓ Quiz aprovado" : unlocked ? `${exam.attempts.length}/3 tentativas utilizadas` : `Bloqueado · aprove ${prerequisite.label}`}</span></button>`;
      }).join("")}</section>
      <section class="study-rules"><strong>Como funciona</strong><p>Leia e marque como concluído todo o conteúdo dos quatro temas. Depois, responda 10 questões por tema. Você tem três tentativas por pilar; após três reprovações, será necessário reler todo o conteúdo daquele pilar antes de tentar novamente.</p></section>
    </section>`;
}
function pillarHubView() {
  return `<section class="page"><header class="page-header"><p class="eyebrow">Trilha de aprendizagem</p><h2>Progressão dos pilares</h2><p>Avance na ordem indicada. Cada pilar é liberado após a aprovação no quiz do pilar anterior.</p></header><div class="pillar-grid">${PILLARS.map((pillar, index) => { const unlocked = canAccessPillar(pillar.key), prerequisite = pillarPrerequisite(pillar.key), exam = pillarAssessmentState(pillar.key); return `<button class="pillar-card ${unlocked ? "" : "is-locked"}" data-route="pilar:${pillar.key}" type="button"><span class="pillar-card__top"><span>${pillar.icon}</span><small>${unlocked ? `0${index + 1}` : "🔒"}</small></span><strong>${pillar.label}</strong><span>${pillar.description}</span><span class="pillar-card__progress">${pillarProgress(pillar.key).percent}% concluído</span><span class="pillar-card__status">${exam.passed ? "✓ Quiz aprovado" : unlocked ? "Disponível" : `Aprove ${prerequisite.label} para desbloquear`}</span></button>`; }).join("")}</div></section>`;
}
function pillarView(key) {
  const pillar = PILLARS.find((item) => item.key === key);
  if (!pillar) return homeView();
  if (!canAccessPillar(key)) {
    const prerequisite = pillarPrerequisite(key);
    return `<section class="locked-view"><span class="locked-view__icon">🔒</span><p class="eyebrow">Pilar bloqueado</p><h2>${pillar.label}</h2><p>Para liberar este conteúdo, conclua o material e seja aprovado no quiz ${prerequisite.label}.</p><button class="primary-button" data-route="pilar:${prerequisite.key}" type="button">Continuar no pilar ${prerequisite.label}</button><button class="secondary-button" data-route="pilares" type="button">Ver sequência completa</button></section>`;
  }
  const p = pillarProgress(key), exam = pillarAssessmentState(key);
  return `<section class="page"><button class="back-button" data-route="pilares" type="button">← Todos os pilares</button><header class="page-header"><p class="eyebrow">Pilar de estudo</p><h2>${pillar.label}</h2><p>${pillar.description} Leia e conclua todos os itens de cada tema para liberar o quiz.</p>${progressBar(p, `Leitura do pilar ${pillar.label}`)}</header><div class="subject-grid">${SUBJECTS.map((subject) => {
    const items = pillarItems(key, subject.key);
    const done = items.filter(item => itemStatus(item) === "COMPLETED").length;
    return `<section class="subject-panel"><header><span>${subject.icon}</span><div><h3>${subject.label}</h3><small>${done} de ${items.length} concluídos</small></div></header><div class="subject-items">${items.map(itemCard).join("") || `<p class="muted">Nenhum conteúdo disponível nesta seção.</p>`}</div></section>`;
  }).join("")}</div><section class="assessment-gate ${exam.passed ? "is-complete" : ""}"><div><span>${exam.passed ? "✓ Pilar aprovado" : p.percent === 100 ? "Leitura concluída · quiz liberado" : "Quiz bloqueado até concluir toda a leitura"}</span><strong>Quiz ${pillar.label} · 40 perguntas</strong><small>${exam.attempts.length}/3 tentativas nesta etapa ${exam.bestPercent != null ? `· melhor nota ${exam.bestPercent}%` : ""}</small></div><button class="primary-button" data-route="assessment:${pillarAssessmentKey(key)}" type="button" ${pillarCanQuiz(key) ? "" : "disabled"}>${exam.needsReread ? "Reler e fazer quiz" : exam.passed ? "Aprovado" : "Abrir quiz"}</button>${exam.passed ? `<button class="secondary-button certificate-button" data-action="certificate:${key}" type="button">⬇ Salvar certificado PDF</button>` : ""}</section></section>`;
}

function itemCard(item) {
  return `<button class="content-card" data-open="${item.kind}:${item.id}" type="button"><span class="content-card__meta"><span>${escapeHtml(item.domain)}</span>${statusBadge(item)}</span><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.summary)}</span><span class="content-card__action">Abrir conteúdo →</span></button>`;
}
function assessmentGate(key) {
  const progress = progressState();
  const canTake = LearningEngine.canTakeAssessment(progress, state.catalog, key);
  const assessment = progress.assessments[key];
  if (assessment.passed) {
    const medal = Gamification.achievementForAssessment(key);
    return `<section class="assessment-gate is-complete"><div><span>✓ Avaliação aprovada</span><strong>${escapeHtml(ASSESSMENT_LABELS[key])}</strong>${medal ? `<span>🥇 ${escapeHtml(medal.label)}</span>` : ""}</div><button class="secondary-button" data-route="assessment:${key}" type="button">Refazer</button></section>`;
  }
  return `<section class="assessment-gate"><div><span>${canTake ? "Avaliação disponível" : "Complete os conteúdos obrigatórios para liberar"}</span><strong>${escapeHtml(ASSESSMENT_LABELS[key])}</strong></div><button class="primary-button" data-route="assessment:${key}" type="button" ${canTake ? "" : "disabled"}>${canTake ? "Começar avaliação" : "Bloqueada"}</button></section>`;
}
function areaView(area) {
  const descriptions = {
    aprender: "Construa sua base conceitual com história, fundamentos, conduta, regras e termos do dojo.",
    treinar: "Entenda o propósito de cada técnica e base, assista à demonstração e revise os pontos essenciais antes ou depois do treino presencial.",
  };
  const all = state.catalog.filter((item) => item.area === area);
  const domains = ["todos", ...new Set(all.map((item) => item.domain))];
  const visible = state.filter === "todos" ? all : all.filter((item) => item.domain === state.filter);
  const progress = LearningEngine.calculateAreaProgress(progressState(), state.catalog, area);
  return `<section class="page"><header class="page-header"><p class="eyebrow">Trilha de aprendizagem</p><h2>${AREA_LABELS[area]}</h2><p>${descriptions[area]}</p>${progressBar(progress, "Progresso em " + AREA_LABELS[area])}</header><div class="filter-row" aria-label="Filtrar conteúdos">${domains.map((domain) => `<button class="filter-chip ${state.filter === domain ? "is-active" : ""}" data-filter="${escapeHtml(domain)}" type="button">${escapeHtml(domain)}</button>`).join("")}</div><div class="content-grid">${visible.map(itemCard).join("")}</div>${assessmentGate(area)}</section>`;
}
function kataHubView() {
  const levels = [{ key: "iniciante", label: "Iniciante" }, { key: "intermediario", label: "Intermediário" }, { key: "avancado", label: "Avançado" }];
  const cards = levels.map((level, index) => {
    const unlocked = LearningEngine.canAccessKataLevel(progressState(), level.key);
    const progress = LearningEngine.calculateAreaProgress(progressState(), state.catalog, "kata", level.key);
    const assessment = progressState().assessments["kata-" + level.key];
    const route = unlocked ? "kata-" + level.key : "kata-locked:" + level.key;
    return `<button class="kata-level ${unlocked ? "" : "is-locked"}" data-route="${route}" type="button"><span class="kata-level__number">0${index + 1}</span><span class="kata-level__body"><strong>${level.label}</strong><span>${progress.completed}/${progress.total} katas concluídos</span><span>${assessment.passed ? "✓ Avaliação aprovada" : unlocked ? "Em andamento" : "Conclua o nível anterior para desbloquear"}</span></span><span class="kata-level__state">${assessment.passed ? "✓" : unlocked ? "→" : "🔒"}</span></button>`;
  }).join("");
  const extra = state.catalog.find((item) => item.area === "kata" && item.level === "extra");
  return `<section class="page kata-page"><header class="page-header"><p class="eyebrow">Trilha sequencial</p><h2>Kata</h2><p>Avance do nível Iniciante ao Avançado. Cada kata exige a abertura do vídeo antes da conclusão.</p>${progressBar(LearningEngine.calculateAreaProgress(progressState(), state.catalog, "kata"), "Progresso total em Kata")}</header><div class="kata-path">${cards}</div>${extra ? `<section class="extra-content"><div><span>Conteúdo adicional</span><strong>${escapeHtml(extra.title)}</strong><p>Disponível para estudo, fora do cálculo da trilha principal.</p></div><button class="secondary-button" data-open="kata:${extra.id}" type="button">Abrir</button></section>` : ""}</section>`;
}
function kataLockedView(level) {
  const current = level === "intermediario" ? "Intermediário" : "Avançado";
  const previous = level === "intermediario" ? "Iniciante" : "Intermediário";
  return `<section class="locked-view"><span class="locked-view__icon">🔒</span><p class="eyebrow">Nível bloqueado</p><h2>Kata ${current}</h2><p>Conclua todos os katas e a avaliação do nível ${previous} para desbloquear.</p><button class="primary-button" data-route="katas" type="button">Voltar à trilha de Kata</button></section>`;
}
function kataLevelView(level) {
  if (!LearningEngine.canAccessKataLevel(progressState(), level)) return kataLockedView(level);
  const label = level === "iniciante" ? "Iniciante" : level === "intermediario" ? "Intermediário" : "Avançado";
  const items = state.catalog.filter((item) => item.area === "kata" && item.level === level);
  return `<section class="page"><button class="back-button" data-route="katas" type="button">← Trilha de Kata</button><header class="page-header compact"><p class="eyebrow">Nível disponível</p><h2>Kata ${label}</h2>${progressBar(LearningEngine.calculateAreaProgress(progressState(), state.catalog, "kata", level), "Progresso no nível " + label)}</header><div class="content-grid">${items.map(itemCard).join("")}</div>${assessmentGate("kata-" + level)}</section>`;
}

function renderMedia(item) {
  if (!item.media) return item.pending ? `<div class="pending-panel"><strong>Conteúdo em preparação</strong><span>A associação ainda não publicou a mídia necessária. Este item não bloqueia seu progresso.</span></div>` : "";
  const record = progressState().learningProgress[item.area].items[item.key];
  if (!record?.mediaOpenedAt && record?.status !== "COMPLETED") {
    const label = item.media.type === "video" ? "Assistir vídeo" : "Visualizar imagem";
    return `<div class="media-gate"><span class="media-gate__icon">${item.media.type === "video" ? "▶" : "▧"}</span><div><strong>Conteúdo visual obrigatório</strong><p>Abra a mídia antes de marcar este item como concluído.</p></div><button class="primary-button" data-action="open-media:${item.key}" type="button">${label}</button></div>`;
  }
  if (item.media.type === "image") return `<figure class="media-frame"><img src="../${escapeHtml(item.media.url)}" alt="${escapeHtml(item.title)}" loading="lazy" /></figure>`;
  const embed = youtubeEmbedUrl(item.media.url);
  return `<div class="video-frame"><iframe src="${escapeHtml(embed)}" title="Vídeo: ${escapeHtml(item.title)}" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><a class="text-link" href="${escapeHtml(item.media.url)}" target="_blank" rel="noreferrer">Abrir no YouTube</a>`;
}
function listSection(title, values) {
  const list = asArray(values);
  if (!list.length) return "";
  return `<section class="detail-section"><h3>${escapeHtml(title)}</h3><ul>${list.map((value) => `<li>${escapeHtml(typeof value === "object" ? value.text || value.title : value)}</li>`).join("")}</ul></section>`;
}
function detailView(kind, id) {
  const item = findItem(kind, id);
  if (!item) return '<p class="empty">Conteúdo não encontrado.</p>';
  if (!canAccessPillar(item.pillar)) {
    const prerequisite = pillarPrerequisite(item.pillar);
    return `<section class="locked-view"><span class="locked-view__icon">🔒</span><p class="eyebrow">Conteúdo bloqueado</p><h2>${escapeHtml(item.title)}</h2><p>Este conteúdo pertence ao pilar ${PILLAR_LABEL[item.pillar]}. Primeiro, conclua o pilar ${prerequisite.label} e seja aprovado no quiz.</p><button class="primary-button" data-route="pilar:${prerequisite.key}" type="button">Voltar ao pilar ${prerequisite.label}</button></section>`;
  }
  const raw = item.raw;
  const status = itemStatus(item);
  const canComplete = LearningEngine.canCompleteItem(progressState(), item);
  const favorite = progressState().preferences.favorites.includes(item.key);
  const isTraining = kind === "tecnica" || kind === "base";
  const body = isTraining ? raw.whatIs || raw.longDescription || raw.description || "" : raw.body || raw.longDescription || raw.description || raw.meaning || raw.significado || "";
  const technical = raw.informacoes_tecnicas || {};
  const kataInfo = kind === "kata" ? `<section class="info-grid"><div><span>Nível</span><strong>${escapeHtml(raw.classificacao?.nivel || item.level)}</strong></div><div><span>Movimentos</span><strong>${escapeHtml(technical.quantidade_aproximada_movimentos || "A validar")}</strong></div><div><span>Tempo médio</span><strong>${escapeHtml(technical.tempo_medio_execucao || "A validar")}</strong></div><div><span>Kiai</span><strong>${escapeHtml(technical.quantidade_kiai ?? "A validar")}</strong></div></section>${listSection("Bases utilizadas", raw.bases_utilizadas)}${listSection("Erros comuns", raw.principais_erros)}${listSection("Checklist de aprendizagem", raw.checklist_aprendizagem)}` : "";
  const techniqueInfo = kind === "tecnica" ? `${raw.executionSteps?.length ? `<section class="detail-section"><h3>Passo a passo</h3><ol>${raw.executionSteps.map((step) => `<li><strong>${escapeHtml(step.title)}</strong><span>${escapeHtml(step.text)}</span></li>`).join("")}</ol></section>` : ""}${raw.safetyNote ? `<div class="safety-note">⚠ ${escapeHtml(raw.safetyNote)}</div>` : ""}` : "";
  const trainingInfo = isTraining ? `<section class="training-facts"><div><span>Para que serve</span><p>${escapeHtml(raw.purpose || "A aplicação depende da orientação do sensei e do contexto do treino.")}</p></div>${raw.translation ? `<div><span>Tradução aproximada</span><p>${escapeHtml(raw.translation)}</p></div>` : ""}</section>${listSection("Pontos técnicos", raw.technicalFocus)}${listSection("Como praticar", raw.practiceTips)}${listSection("Erros comuns", raw.commonMistakes)}${state.data.trainingContent?.references?.length ? `<section class="detail-section source-section"><h3>Referências de estudo</h3><ul>${state.data.trainingContent.references.map((source) => `<li><a class="text-link" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)}</a></li>`).join("")}</ul></section>` : ""}` : "";
  const hint = item.pending ? "Este conteúdo ainda está em preparação e não bloqueia seu progresso." : item.mediaRequired ? "Visualize o conteúdo deste item antes de marcá-lo como concluído." : "Abra este conteúdo antes de concluí-lo.";
  return `<article class="detail-page"><button class="back-button" data-action="back" type="button">← Voltar</button><header class="detail-hero"><div><p class="eyebrow">${escapeHtml(item.domain)}</p><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.summary)}</p></div>${statusBadge(item)}</header>${renderMedia(item)}<section class="detail-copy">${body ? body.split(/\n{2,}/).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("") : ""}</section>${kataInfo}${trainingInfo}${techniqueInfo}<footer class="detail-actions"><button class="secondary-button" data-action="favorite:${item.key}" type="button">${favorite ? "★ Favorito" : "☆ Favoritar"}</button><button class="primary-button" data-action="complete:${item.key}" type="button" ${canComplete || status === "COMPLETED" ? "" : "disabled"}>${status === "COMPLETED" ? "✓ Conteúdo concluído" : "Marcar como concluído"}</button></footer>${status !== "COMPLETED" && !canComplete ? `<p class="completion-hint">${hint}</p>` : ""}</article>`;
}
function assessmentQuestions(key) {
  if (!key.startsWith("pilar-")) return [];
  const pools = {
    kata: [...state.data.quiz.filter((q) => /kata/i.test(q.category)), ...state.data.quizKataIniciante, ...state.data.quizKataIntermediario, ...state.data.quizKataAvancado],
    kihon: state.data.quiz.filter((q) => ["Fundamentos", "Tecnicas Basicas", "Bases e Termos"].includes(q.category)),
    kumite: [
      ...state.data.quiz.filter((q) => q.category === "Regras de Kumite"),
      { id: "kumite-extra-kiken", category: "Regras de Kumite", question: "Nas regras estudadas, quando pode ser aplicado o Kiken?", options: ["Quando o atleta não se apresenta, abandona ou não pode continuar", "Quando o atleta marca o primeiro ponto", "Quando o árbitro encerra o tempo normalmente", "Quando os atletas iniciam a saudação"], correctOption: 0, explanation: "Kiken se aplica quando o atleta não se apresenta, abandona, não pode continuar ou é retirado por ordem médica." },
      { id: "kumite-extra-yame", category: "Regras de Kumite", question: "Qual comando do árbitro interrompe o encontro?", options: ["Hajime", "Yame", "Rei", "Kamae"], correctOption: 1, explanation: "O árbitro utiliza Yame para interromper o encontro." },
      { id: "kumite-extra-criteria", category: "Regras de Kumite", question: "Qual conjunto reúne critérios de avaliação de uma técnica de Kumite?", options: ["Boa forma, atitude esportiva, vigor, Zanshin, tempo e distância", "Somente força e velocidade", "Altura do salto e duração do kiai", "Número de técnicas executadas sem pausa"], correctOption: 0, explanation: "Os critérios incluem boa forma, atitude esportiva, aplicação vigorosa, Zanshin, tempo e distância correta." },
      { id: "kumite-extra-timing", category: "Regras de Kumite", question: "Quando começa a cronometragem de uma disputa de Kumite?", options: ["Quando os atletas entram no ginásio", "Quando o árbitro dá o sinal para começar", "Após o primeiro ponto", "Quando termina a saudação final"], correctOption: 1, explanation: "A cronometragem começa com o sinal do árbitro para iniciar o encontro." },
    ],
    geral: state.data.quiz.filter((q) => !/kata/i.test(q.category) && !["Fundamentos", "Tecnicas Basicas", "Bases e Termos", "Regras de Kumite"].includes(q.category)),
  };
  const pillarKey = key.slice("pilar-".length);
  return SUBJECTS.flatMap((subject) => {
    const pool = pools[subject.key];
    if (!pool.length) return [];
    return Array.from({ length: 10 }, (_, index) => {
      const source = pool[(index + PILLARS.findIndex((p) => p.key === pillarKey)) % pool.length];
      return { ...source, id: `${key}-${subject.key}-${index + 1}`, category: subject.label };
    });
  });
}
function startAssessment(key) {
  const pillar = key.startsWith("pilar-") ? key.slice(6) : "";
  if (!pillar || !canAccessPillar(pillar) || !pillarCanQuiz(pillar)) {
    state.notice = "Conclua a leitura obrigatória do pilar antes de iniciar o quiz. Após três reprovações, releia todos os conteúdos para liberar novas tentativas."; render(); return;
  }
  const record = pillarAssessmentState(pillar);
  if (record.needsReread && record.attempts.length >= 3) state.progressService.update((progress) => {
    const assessment = progress.assessments[key];
    assessment.attempts = []; assessment.bestPercent = undefined; assessment.needsReread = false;
  });
  state.assessment = { key, questions: assessmentQuestions(key), index: 0, answers: [] };
  state.assessmentResult = null; routeTo("assessment-run");
}
function assessmentLanding(key) {
  const pillar = key.startsWith("pilar-") ? key.slice(6) : "";
  if (!pillar || !PILLAR_LABEL[pillar]) return homeView();
  if (!canAccessPillar(pillar)) {
    const prerequisite = pillarPrerequisite(pillar);
    return `<section class="locked-view"><span class="locked-view__icon">🔒</span><p class="eyebrow">Quiz bloqueado</p><h2>Quiz ${PILLAR_LABEL[pillar]}</h2><p>Seja aprovado no quiz ${prerequisite.label} para liberar este pilar e sua avaliação.</p><button class="primary-button" data-route="pilar:${prerequisite.key}" type="button">Continuar no pilar ${prerequisite.label}</button></section>`;
  }
  const record = pillar ? pillarAssessmentState(pillar) : { attempts: [], passed: false };
  const label = pillar ? `Pilar ${PILLAR_LABEL[pillar]}` : ASSESSMENT_LABELS[key] || "Avaliação";
  return `<section class="assessment-intro"><span class="assessment-intro__icon">問</span><p class="eyebrow">Avaliação obrigatória</p><h2>${escapeHtml(label)}</h2><p>São 40 perguntas: 10 de Kata, 10 de Kihon, 10 de Kumite e 10 de assuntos gerais. Aproveitamento mínimo: 70%. Você tem até três tentativas antes de precisar reler todo o conteúdo deste pilar.</p><p class="muted">Tentativas disponíveis: ${Math.max(0, 3 - record.attempts.length)} de 3${record.bestPercent != null ? ` · melhor resultado: ${record.bestPercent}%` : ""}</p><button class="primary-button" data-action="start-assessment:${key}" type="button" ${pillar && pillarCanQuiz(pillar) ? "" : "disabled"}>Começar quiz</button><button class="text-button" data-route="pilar:${pillar}" type="button">Voltar ao conteúdo</button></section>`;
}

function assessmentRunView() {
  if (!state.assessment) return homeView();
  const { questions, index, answers, key } = state.assessment;
  const question = questions[index];
  return `<section class="quiz-shell"><header><span>Questão ${index + 1} de ${questions.length}</span><strong>${escapeHtml(key.startsWith("pilar-") ? `Pilar ${PILLAR_LABEL[key.slice(6)]}` : ASSESSMENT_LABELS[key])}</strong></header><div class="quiz-progress"><span style="width:${Math.round(((index + 1) / questions.length) * 100)}%"></span></div><article class="question-card"><p class="eyebrow">${escapeHtml(question.category)}</p><h2>${escapeHtml(question.question)}</h2><div class="answers">${question.options.map((option, optionIndex) => `<button class="answer ${answers[index] === optionIndex ? "is-selected" : ""}" data-answer="${optionIndex}" type="button"><span>${String.fromCharCode(65 + optionIndex)}</span>${escapeHtml(option)}</button>`).join("")}</div></article><button class="primary-button wide" data-action="next-assessment" type="button" ${Number.isInteger(answers[index]) ? "" : "disabled"}>${index === questions.length - 1 ? "Finalizar avaliação" : "Próxima questão"}</button></section>`;
}
function finishAssessment() {
  const { key, questions, answers } = state.assessment;
  const before = [...progressState().achievements.medals];
  const result = AssessmentEngine.evaluate(questions, answers);
  let exhausted = false;
  state.progressService.update((progress, now) => {
    const record = progress.assessments[key];
    record.attempts.push({ ...result, date: now() });
    record.bestPercent = Math.max(record.bestPercent || 0, result.percent);
    record.passed = result.passed;
    if (result.passed) record.passedAt = now();
    else if (record.attempts.length >= 3) {
      record.needsReread = true; exhausted = true;
      const pillar = key.slice(6);
      state.catalog.filter((item) => item.pillar === pillar).forEach((item) => {
        delete progress.learningProgress[item.area].items[item.key];
      });
    }
  });
  state.assessmentResult = { ...result, key, questions, answers, exhausted };
  const newMedal = progressState().achievements.medals.find((medal) => !before.includes(medal));
  if (newMedal) state.achievement = { type: "medal", key: newMedal, percent: result.percent };
  routeTo("assessment-result");
}
function assessmentResultView() {
  const result = state.assessmentResult;
  if (!result) return homeView();
  const wrong = result.questions.map((question, index) => ({ question, answer: result.answers[index] })).filter(({ question, answer }) => answer !== question.correctOption);
  const backRoute = result.key.startsWith("kata-") ? result.key : result.key;
  return `<section class="result-page ${result.passed ? "is-pass" : "is-fail"}"><span class="result-icon">${result.passed ? "✓" : "↻"}</span><p class="eyebrow">${result.passed ? "Avaliação concluída" : "Continue praticando"}</p><h2>${result.percent}% de aproveitamento</h2><p>${result.score} de ${result.total} respostas corretas. ${result.passed ? "Você atingiu o resultado necessário." : result.exhausted ? "As três tentativas foram utilizadas. Releia todos os conteúdos deste pilar para liberar uma nova série de tentativas." : "Revise os pontos abaixo e tente novamente quando estiver pronto."}</p>${wrong.length ? `<section class="review-list"><h3>Revise estes pontos</h3>${wrong.map(({ question }) => `<div><strong>${escapeHtml(question.question)}</strong><span>${escapeHtml(question.explanation)}</span></div>`).join("")}</section>` : ""}<div class="result-actions">${result.passed && result.key.startsWith("pilar-") ? `<button class="primary-button" data-action="certificate:${result.key.slice(6)}" type="button">⬇ Salvar certificado PDF</button>` : ""}${!result.passed && !result.exhausted ? `<button class="primary-button" data-action="start-assessment:${result.key}" type="button">Tentar novamente (${Math.max(0, 3 - pillarAssessmentState(result.key.slice(6)).attempts.length)} restantes)</button>` : ""}<button class="secondary-button" data-route="pilar:${result.key.slice(6)}" type="button">Voltar ao pilar</button></div></section>`;
}

function finalChallengeView() {
  const unlocked = LearningEngine.canAccessFinalChallenge(progressState());
  if (!unlocked) return `<section class="locked-view"><span class="locked-view__icon">🔒</span><p class="eyebrow">Desafio Final</p><h2>O dojo ainda está fechado</h2><p>Conquiste as medalhas Aprender, Treinar e Kata para entrar.</p><div class="achievement-strip">${medalState("aprender")}${medalState("treinar")}${medalState("kata")}</div><button class="primary-button" data-route="home" type="button">Voltar ao dashboard</button></section>`;
  const trophy = progressState().achievements.trophy;
  return `<section class="dojo-entry"><div class="dojo-gate"><span>押忍</span></div><p class="eyebrow">Desafio Final</p><h2>Dojo Challenge</h2><p>Cinco rounds combinam Aprender, Treinar e Kata em diferentes tipos de desafio. Alcance 70% para conquistar o troféu.</p><div class="achievement-strip">${medalState("aprender")}${medalState("treinar")}${medalState("kata")}</div>${trophy ? `<p class="trophy-note">🏆 Melhor jornada concluída: ${progressState().assessments.finalChallenge.bestPercent}%</p>` : ""}<button class="primary-button" data-action="start-challenge" type="button">${trophy ? "Entrar novamente" : "Entrar no dojo"}</button></section>`;
}
function startChallenge() {
  state.challenge = { challenges: ChallengeEngine.createSession(state.data.finalChallenge, Date.now()), index: 0, answers: [] };
  state.challengeResult = null; routeTo("challenge-run");
}
function challengeMedia(challenge) {
  if (!challenge.media) return "";
  if (challenge.media.type === "image") return `<figure class="challenge-media"><img src="../${escapeHtml(challenge.media.url)}" alt="${escapeHtml(challenge.media.alt || "")}" /></figure>`;
  return `<div class="video-frame challenge-media"><iframe src="${escapeHtml(youtubeEmbedUrl(challenge.media.url))}" title="Vídeo do desafio" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
}
function challengeInteraction(challenge, answer) {
  if (challenge.type === "MATCHING") {
    const rights = challenge.pairs.map((pair) => pair.right);
    return `<div class="matching-grid">${challenge.pairs.map((pair) => `<label><span>${escapeHtml(pair.left)}</span><select data-match="${escapeHtml(pair.left)}"><option value="">Escolha...</option>${rights.map((right) => `<option value="${escapeHtml(right)}" ${answer?.[pair.left] === right ? "selected" : ""}>${escapeHtml(right)}</option>`).join("")}</select></label>`).join("")}</div>`;
  }
  if (challenge.type === "ORDERING") {
    if (!Array.isArray(state.challenge.answers[state.challenge.index])) state.challenge.answers[state.challenge.index] = [...challenge.options].reverse();
    const ordered = state.challenge.answers[state.challenge.index];
    return `<ol class="ordering-list">${ordered.map((value, index) => `<li><span>${escapeHtml(value)}</span><span><button aria-label="Mover para cima" data-order="up:${index}" type="button" ${index === 0 ? "disabled" : ""}>↑</button><button aria-label="Mover para baixo" data-order="down:${index}" type="button" ${index === ordered.length - 1 ? "disabled" : ""}>↓</button></span></li>`).join("")}</ol>`;
  }
  return `<div class="answers">${challenge.options.map((option, index) => `<button class="answer ${answer === index ? "is-selected" : ""}" data-challenge-answer="${index}" type="button"><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(option)}</button>`).join("")}</div>`;
}
function challengeRunView() {
  if (!state.challenge) return finalChallengeView();
  const { challenges, index, answers } = state.challenge;
  const challenge = challenges[index];
  const rounds = Math.max(...challenges.map((item) => item.round));
  return `<section class="challenge-shell"><header class="round-header"><div><p class="eyebrow">Dojo Challenge</p><h2>Round ${challenge.round} de ${rounds}</h2></div><span>${index + 1}/${challenges.length}</span></header><div class="quiz-progress"><span style="width:${Math.round(((index + 1) / challenges.length) * 100)}%"></span></div><article class="question-card challenge-card"><span class="domain-tag domain-tag--${challenge.area}">${AREA_LABELS[challenge.area]}</span><span class="type-tag">${escapeHtml(challenge.type.replaceAll("_", " "))}</span><h2>${escapeHtml(challenge.prompt)}</h2>${challengeMedia(challenge)}${challengeInteraction(challenge, answers[index])}</article>${state.notice ? `<p class="form-notice" role="alert">${escapeHtml(state.notice)}</p>` : ""}<button class="primary-button wide" data-action="next-challenge" type="button">${index === challenges.length - 1 ? "Concluir desafio" : "Avançar no dojo"}</button></section>`;
}
function challengeAnswerReady(challenge, answer) {
  if (challenge.type === "MATCHING") return answer && challenge.pairs.every((pair) => answer[pair.left]);
  if (challenge.type === "ORDERING") return Array.isArray(answer) && answer.length === challenge.options.length;
  return Number.isInteger(answer);
}
function finishChallenge() {
  const result = ChallengeEngine.summarize(state.challenge.challenges, state.challenge.answers);
  const hadTrophy = Boolean(progressState().achievements.trophy);
  state.progressService.update((progress, now) => ChallengeEngine.recordResult(progress, result, now()));
  state.challengeResult = result;
  if (result.passed && !hadTrophy) state.achievement = { type: "trophy", percent: result.percent };
  routeTo("challenge-result");
}
function challengeResultView() {
  const result = state.challengeResult;
  if (!result) return finalChallengeView();
  const entries = Object.entries(result.areas);
  const weakest = entries.reduce((lowest, current) => current[1].percent < lowest[1].percent ? current : lowest);
  return `<section class="result-page challenge-result ${result.passed ? "is-pass" : "is-fail"}"><span class="result-icon">${result.passed ? "🏆" : "↻"}</span><p class="eyebrow">${result.passed ? "Jornada concluída" : "O dojo continua aberto"}</p><h2>Resultado geral: ${result.percent}%</h2><div class="area-results">${entries.map(([area, value]) => `<div><span>${AREA_LABELS[area]}</span><strong>${value.percent}%</strong></div>`).join("")}</div><p>${result.passed ? "Você superou o Desafio Final e conquistou o Troféu da Jornada." : AREA_LABELS[weakest[0]] + " foi sua área com menor aproveitamento. Revise esse conteúdo antes de uma nova tentativa."}</p><div class="result-actions"><button class="primary-button" data-action="start-challenge" type="button">Tentar novamente</button><button class="secondary-button" data-route="home" type="button">Voltar ao dashboard</button></div></section>`;
}
function searchView() {
  const groups = SearchService.search(state.catalog, state.search);
  const order = ["Conteúdos", "Glossário", "Regras", "Técnicas", "Bases", "Katas"];
  return `<section class="page"><header class="page-header compact"><p class="eyebrow">Busca global</p><h2>Encontre qualquer conteúdo</h2><p>A busca ignora acentos e consulta títulos, descrições, passos, termos e informações relacionadas.</p></header><div class="search-row search-row--page"><input class="search-input" id="searchInput" value="${escapeHtml(state.search)}" aria-label="Termo de busca" placeholder="Digite um termo..." /><button class="primary-button" data-action="search" type="button">Buscar</button></div>${state.search && !Object.keys(groups).length ? `<p class="empty">Nenhum conteúdo encontrado para “${escapeHtml(state.search)}”.</p>` : ""}<div class="search-groups">${order.filter((domain) => groups[domain]?.length).map((domain) => `<section><h3>${domain} <span>${groups[domain].length}</span></h3><div class="content-grid">${groups[domain].map(itemCard).join("")}</div></section>`).join("")}</div></section>`;
}
function progressView() {
  return `<section class="page"><header class="page-header"><p class="eyebrow">Sua jornada</p><h2>Progresso dos pilares</h2><p>Acompanhe leituras concluídas, aprovação e tentativas restantes em cada etapa.</p></header><div class="progress-dashboard">${PILLARS.map((pillar) => {
    const p = pillarProgress(pillar.key), exam = pillarAssessmentState(pillar.key);
    return `<section><div class="progress-dashboard__title"><strong>${pillar.label}</strong><span>${exam.passed ? "✓ Aprovado" : `${Math.max(0, 3 - exam.attempts.length)} tentativa(s) restante(s)`}</span></div>${progressBar(p, "Conteúdo lido")}${exam.bestPercent != null ? `<p class="muted">Melhor resultado no quiz: ${exam.bestPercent}%</p>` : ""}${exam.needsReread ? `<p class="form-notice">Leia novamente todo o conteúdo deste pilar para continuar.</p>` : ""}${exam.passed ? `<button class="secondary-button certificate-button" data-action="certificate:${pillar.key}" type="button">⬇ Salvar certificado PDF</button>` : ""}</section>`;
  }).join("")}</div></section>`;
}

function loadImageForCertificate(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível carregar o logo ou a assinatura do certificado."));
    image.src = new URL(path, location.href).href;
  });
}

function drawCertificateWrappedText(context, text, centerX, startY, maxWidth, lineHeight) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  lines.forEach((value, index) => context.fillText(value, centerX, startY + index * lineHeight));
  return lines.length;
}

async function downloadStudyCertificate(pillarKey) {
  const pillar = PILLARS.find((item) => item.key === pillarKey);
  const assessment = pillar ? pillarAssessmentState(pillar.key) : null;
  if (!pillar || !assessment?.passed) throw new Error("O certificado fica disponível após a aprovação no quiz do nível.");

  const [logo, signature] = await Promise.all([
    loadImageForCertificate("../assets/brand/atarashii-logo.png"),
    loadImageForCertificate("../assets/brand/assinatura-sensei-luiz-costa.jpg"),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = 2480;
  canvas.height = 3508;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Seu navegador não conseguiu preparar o certificado.");

  const w = canvas.width, h = canvas.height, center = w / 2;
  context.fillStyle = "#fffdf7";
  context.fillRect(0, 0, w, h);
  context.strokeStyle = "#7f1717";
  context.lineWidth = 28;
  context.strokeRect(76, 76, w - 152, h - 152);
  context.strokeStyle = "#bf9853";
  context.lineWidth = 8;
  context.strokeRect(112, 112, w - 224, h - 224);

  const logoHeight = 470;
  const logoWidth = logoHeight * (logo.naturalWidth / logo.naturalHeight);
  context.drawImage(logo, center - logoWidth / 2, 250, logoWidth, logoHeight);
  context.textAlign = "center";
  context.fillStyle = "#7f1717";
  context.font = "bold 58px Georgia, serif";
  context.fillText("ASSOCIAÇÃO ATARASHII KARATE-DO SHOTOKAN", center, 845);
  context.fillStyle = "#20242b";
  context.font = "bold 96px Georgia, serif";
  context.fillText("CERTIFICADO DE CONCLUSÃO", center, 1110);
  context.strokeStyle = "#bf9853";
  context.lineWidth = 5;
  context.beginPath(); context.moveTo(420, 1185); context.lineTo(w - 420, 1185); context.stroke();
  context.fillStyle = "#555b63";
  context.font = "48px Georgia, serif";
  context.fillText("Certificamos que", center, 1380);

  const studentName = state.currentUser?.nome || state.currentUser?.usuario || "Aluno";
  let nameFontSize = 96;
  context.font = `bold ${nameFontSize}px Georgia, serif`;
  while (context.measureText(studentName).width > w - 520 && nameFontSize > 54) {
    nameFontSize -= 2;
    context.font = `bold ${nameFontSize}px Georgia, serif`;
  }
  context.fillStyle = "#20242b";
  const nameLineHeight = Math.round(nameFontSize * 1.2);
  const nameLineCount = drawCertificateWrappedText(context, studentName, center, 1605, w - 520, nameLineHeight);
  const nameShift = Math.max(0, nameLineCount - 1) * nameLineHeight;
  context.strokeStyle = "#7f1717";
  context.lineWidth = 3;
  context.beginPath(); context.moveTo(450, 1655 + nameShift); context.lineTo(w - 450, 1655 + nameShift); context.stroke();

  context.fillStyle = "#555b63";
  context.font = "48px Georgia, serif";
  context.fillText("concluiu com êxito e foi aprovado no nível", center, 1845 + nameShift);
  context.fillStyle = "#7f1717";
  context.font = "bold 116px Georgia, serif";
  context.fillText(pillar.label.toUpperCase(), center, 2075 + nameShift);
  context.fillStyle = "#343a40";
  context.font = "42px Georgia, serif";
  drawCertificateWrappedText(
    context,
    "do Guia de Estudos de Karate Shotokan, após concluir os conteúdos obrigatórios e obter aprovação no quiz correspondente.",
    center,
    2235 + nameShift,
    w - 560,
    64
  );

  const issued = assessment.passedAt ? new Date(assessment.passedAt) : new Date();
  const dateLabel = Number.isNaN(issued.getTime()) ? new Date().toLocaleDateString("pt-BR") : issued.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  context.fillStyle = "#555b63";
  context.font = "38px Georgia, serif";
  context.fillText(`Emitido em ${dateLabel}`, center, 2550 + nameShift);

  const signatureWidth = 560;
  const signatureHeight = signatureWidth * (signature.naturalHeight / signature.naturalWidth);
  context.drawImage(signature, center - signatureWidth / 2, 2730 + nameShift, signatureWidth, signatureHeight);
  context.strokeStyle = "#343a40";
  context.lineWidth = 3;
  context.beginPath(); context.moveTo(center - 390, 2965 + nameShift); context.lineTo(center + 390, 2965 + nameShift); context.stroke();
  context.fillStyle = "#20242b";
  context.font = "bold 42px Georgia, serif";
  context.fillText("Sensei Luiz Costa", center, 3035 + nameShift);
  context.fillStyle = "#555b63";
  context.font = "34px Georgia, serif";
  context.fillText("Professor responsável", center, 3090 + nameShift);
  context.font = "bold 30px Georgia, serif";
  context.fillStyle = "#7f1717";
  context.fillText("ASSOCIAÇÃO ATARASHII KARATE-DO SHOTOKAN", center, 3260 + nameShift);

  const jpegUrl = canvas.toDataURL("image/jpeg", 0.94);
  const jpegBinary = atob(jpegUrl.slice(jpegUrl.indexOf(",") + 1));
  const jpegBytes = new Uint8Array(jpegBinary.length);
  for (let index = 0; index < jpegBinary.length; index += 1) jpegBytes[index] = jpegBinary.charCodeAt(index);
  const pdfBytes = CertificatePdf.pdfFromJpeg(jpegBytes, canvas.width, canvas.height);
  const pdf = new Blob([pdfBytes], { type: "application/pdf" });
  const studentSlug = studentName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(pdf);
  link.download = `certificado-atarashii-${pillarKey}-${studentSlug || "aluno"}.pdf`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 60000);
}

function atarashiiView() {
  return `<article class="detail-page institutional"><button class="back-button" data-route="home" type="button">← Home</button><p class="eyebrow">Nossa associação</p><h2>A história por trás da Atarashii</h2><div class="story-copy"><p>A Associação Atarashii Karate-Do Shotokan nasceu da dedicação do Sensei Luiz ao Karate e ao ensino.</p><p>Seu contato com o Karate começou em 2002. Em 2009 conquistou a faixa preta e, a partir de 2014, descobriu sua vocação para ministrar aulas.</p><p>A associação foi criada em 2017 e atende crianças, adolescentes, adultos e idosos.</p><p>O aplicativo amplia esse trabalho como apoio ao estudo. Ele não substitui o dojo, o treino presencial nem a orientação do sensei.</p></div><p class="signature">Sensei Luiz · Fundador da Associação Atarashii Karate-Do Shotokan</p></article>`;
}
function contactView() {
  return `<section class="detail-page institutional"><button class="back-button" data-route="home" type="button">← Home</button><p class="eyebrow">Fale conosco</p><h2>Contato</h2><div class="contact-card"><span>Local de treino</span><strong>${escapeHtml(contactInfo.place)}</strong><p>${escapeHtml(contactInfo.address)}</p><div class="contact-actions"><a class="primary-button" href="${contactInfo.mapsUrl}" target="_blank" rel="noreferrer">Abrir no mapa</a><a class="secondary-button" href="${contactInfo.instagramUrl}" target="_blank" rel="noreferrer">Instagram</a><a class="secondary-button" href="https://wa.me/${contactInfo.whatsappNumber}" target="_blank" rel="noreferrer">WhatsApp</a></div></div></section>`;
}
function achievementOverlay() {
  if (!state.achievement) return "";
  if (state.achievement.type === "trophy") return `<div class="achievement-overlay" role="dialog" aria-modal="true" aria-labelledby="achievementTitle"><div class="achievement-modal"><span class="achievement-modal__icon">🏆</span><p class="eyebrow">Jornada concluída</p><h2 id="achievementTitle">Desafio Final superado</h2><div class="achievement-strip">${medalState("aprender")}${medalState("treinar")}${medalState("kata")}</div><p>Resultado: <strong>${state.achievement.percent}%</strong></p><button class="primary-button" data-action="close-achievement" type="button">Ver resultado</button></div></div>`;
  const medal = Gamification.MEDALS[state.achievement.key];
  return `<div class="achievement-overlay" role="dialog" aria-modal="true" aria-labelledby="achievementTitle"><div class="achievement-modal"><span class="achievement-modal__icon">🥇</span><p class="eyebrow">Parabéns</p><h2 id="achievementTitle">Você conquistou</h2><strong class="achievement-name">${escapeHtml(medal.label)}</strong><p>Avaliação: <strong>${state.achievement.percent}%</strong></p><button class="primary-button" data-action="close-achievement" type="button">Continuar jornada</button></div></div>`;
}
function render() {
  if (!state.data || !state.progressService) { app.innerHTML = '<p class="empty">Carregando sua jornada...</p>'; return; }
  let view;
  if (state.route.startsWith("detail:")) { const [, kind, id] = state.route.split(":"); view = detailView(kind, id); }
  else if (state.route.startsWith("kata-locked:")) view = kataLockedView(state.route.split(":")[1]);
  else if (state.route.startsWith("assessment:")) view = assessmentLanding(state.route.split(":")[1]);
  else if (state.route.startsWith("pilar:")) view = pillarView(state.route.split(":")[1]);
  else {
    const views = {
      home: homeView, pilares: pillarHubView, aprender: pillarHubView, treinar: pillarHubView,
      katas: pillarHubView, "kata-iniciante": pillarHubView,
      "kata-intermediario": pillarHubView, "kata-avancado": pillarHubView,
      "assessment-run": assessmentRunView, "assessment-result": assessmentResultView,
      "desafio-final": finalChallengeView, "challenge-run": challengeRunView,
      "challenge-result": challengeResultView, busca: searchView, progresso: progressView,
      atarashii: atarashiiView, contato: contactView,
    };
    view = (views[state.route] || homeView)();
  }
  app.innerHTML = `${state.notice && !state.route.startsWith("challenge") ? `<p class="global-notice" role="status">${escapeHtml(state.notice)}</p>` : ""}${view}${achievementOverlay()}`;
  tabs.forEach((tab) => {
    const active = tab.dataset.route === state.route || (tab.dataset.route === "pilares" && state.route.startsWith("pilar:")) || (tab.dataset.route === "katas" && state.route.startsWith("kata-")) || (tab.dataset.route === "desafio-final" && state.route.startsWith("challenge"));
    tab.classList.toggle("is-active", active); tab.setAttribute("aria-current", active ? "page" : "false");
  });
}

document.addEventListener("click", (event) => {
  const route = event.target.closest("[data-route]");
  if (route) {
    const target = route.dataset.route;
    if (target.startsWith("detail:")) {
      const [, kind, id] = target.split(":");
      openDetail(kind, id);
    } else routeTo(target);
    return;
  }
  const open = event.target.closest("[data-open]");
  if (open) { const [kind, id] = open.dataset.open.split(":"); openDetail(kind, id); return; }
  const filter = event.target.closest("[data-filter]");
  if (filter) { state.filter = filter.dataset.filter; render(); return; }
  const answer = event.target.closest("[data-answer]");
  if (answer && state.assessment) { state.assessment.answers[state.assessment.index] = Number(answer.dataset.answer); render(); return; }
  const challengeAnswer = event.target.closest("[data-challenge-answer]");
  if (challengeAnswer && state.challenge) { state.challenge.answers[state.challenge.index] = Number(challengeAnswer.dataset.challengeAnswer); state.notice = ""; render(); return; }
  const order = event.target.closest("[data-order]");
  if (order && state.challenge) {
    const [direction, rawIndex] = order.dataset.order.split(":");
    const index = Number(rawIndex), values = state.challenge.answers[state.challenge.index];
    const target = direction === "up" ? index - 1 : index + 1;
    [values[index], values[target]] = [values[target], values[index]]; render(); return;
  }
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;
  const action = actionTarget.dataset.action;
  if (action === "back") routeTo(state.returnRoute || "home");
  else if (action.startsWith("certificate:")) {
    const pillarKey = action.slice("certificate:".length);
    downloadStudyCertificate(pillarKey).then(() => {
      state.notice = `Certificado do nível ${PILLAR_LABEL[pillarKey]} baixado.`;
      render();
    }).catch((error) => {
      state.notice = error.message || "Não foi possível gerar o certificado.";
      render();
    });
  }
  else if (action === "home-search" || action === "search") {
    state.search = document.querySelector(action === "home-search" ? "#homeSearch" : "#searchInput")?.value || "";
    if (state.search.trim().toUpperCase() === "AMS1981") {
      state.progressService.update((progress, now) => ProgressService.activateTestMode(progress, state.catalog, now()));
      state.search = "";
      routeTo("home");
      state.notice = "Modo de teste ativado: avaliações em 100%, três medalhas e troféu liberados.";
      render();
      return;
    }
    routeTo("busca");
  } else if (action.startsWith("open-media:")) {
    const item = itemByKey(action.slice("open-media:".length));
    state.progressService.update((progress, now) => LearningEngine.markItemOpened(progress, item, now(), "media"));
    state.notice = "Conteúdo visual aberto. Agora você pode concluir este item quando terminar sua revisão."; render();
  } else if (action.startsWith("complete:")) {
    const item = itemByKey(action.slice("complete:".length));
    let completion;
    state.progressService.update((progress, now) => { completion = LearningEngine.completeItem(progress, item, now()); });
    state.notice = completion?.ok ? "Conteúdo concluído. Seu progresso foi atualizado." : "Visualize o conteúdo antes de marcá-lo como concluído."; render();
  } else if (action.startsWith("favorite:")) {
    const key = action.slice("favorite:".length);
    state.progressService.update((progress) => {
      const favorites = progress.preferences.favorites;
      progress.preferences.favorites = favorites.includes(key) ? favorites.filter((value) => value !== key) : [...favorites, key];
    }); render();
  } else if (action.startsWith("start-assessment:")) startAssessment(action.slice("start-assessment:".length));
  else if (action === "next-assessment") {
    if (state.assessment.index < state.assessment.questions.length - 1) { state.assessment.index += 1; render(); }
    else finishAssessment();
  } else if (action === "start-challenge") startChallenge();
  else if (action === "next-challenge") {
    const challenge = state.challenge.challenges[state.challenge.index];
    if (challenge.type === "MATCHING") {
      const mapped = {};
      document.querySelectorAll("[data-match]").forEach((select) => { mapped[select.dataset.match] = select.value; });
      state.challenge.answers[state.challenge.index] = mapped;
    }
    if (!challengeAnswerReady(challenge, state.challenge.answers[state.challenge.index])) { state.notice = "Responda ao desafio antes de continuar."; render(); return; }
    state.notice = "";
    if (state.challenge.index < state.challenge.challenges.length - 1) { state.challenge.index += 1; render(); }
    else finishChallenge();
  } else if (action === "close-achievement") { state.achievement = null; render(); }
});

document.querySelector("#progressButton").addEventListener("click", () => routeTo("progresso"));
document.querySelector("#refreshButton").addEventListener("click", () => location.reload());
window.addEventListener("study:progress-sync-error", () => {
  state.notice = "Não foi possível sincronizar seu progresso. Verifique sua conexão e tente novamente.";
  render();
});
window.addEventListener("popstate", () => { state.route = location.hash.slice(1) || "home"; render(); });
loadData().then((authenticated) => { if (!authenticated) return; state.route = location.hash.slice(1) || "home"; render(); }).catch((error) => {
  app.innerHTML = '<p class="empty">Não foi possível carregar o aplicativo. Tente atualizar a página.</p>';
  console.error(error);
});
