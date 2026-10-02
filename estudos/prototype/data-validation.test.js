const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const dataDir = path.resolve(__dirname, "../data");
const read = (name) => JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf8"));
test("todos os JSONs usam JSON estrito sem BOM", () => {
  for (const name of fs.readdirSync(dataDir).filter((file) => file.endsWith(".json"))) {
    const raw = fs.readFileSync(path.join(dataDir, name), "utf8");
    assert.equal(raw.charCodeAt(0) === 0xfeff, false, name + " possui BOM");
    assert.doesNotThrow(() => JSON.parse(raw), name);
  }
});
test("catalogo oficial possui 27 katas com IDs unicos", () => {
  const katas = read("katas-shotokan-complete.json").katas;
  assert.equal(katas.length, 27);
  assert.equal(new Set(katas.map((item) => item.id)).size, 27);
});
test("quiz de Kata básico tem 10 perguntas apoiadas nos conteúdos Heian e não cobra kata avançado", () => {
  const beginnerQuiz = read("quiz-kata-iniciante.json");
  const beginnerKatas = read("katas-shotokan-complete.json").katas.filter((kata) => kata.nivelJogo === "iniciante");
  assert.equal(beginnerQuiz.length, 10);
  assert.equal(beginnerKatas.length, 5);
  for (const kata of beginnerKatas) assert.ok(beginnerQuiz.some((question) => question.question.includes(kata.nome)));
  const serialized = JSON.stringify(beginnerQuiz).toLowerCase();
  for (const advancedName of ["kanku", "bassai", "jitte", "gankaku", "nijushiho", "unsu", "sochin"]) {
    assert.equal(serialized.includes(advancedName), false, `kata avançado vazou para o quiz básico: ${advancedName}`);
  }
  assert.match(serialized, /embusen|postura|kiai|ritmo|consultar o material/);
});
test("desafio final possui cinco rounds equilibrados", () => {
  const challenges = read("final-challenge.json");
  assert.deepEqual([...new Set(challenges.map((item) => item.round))], [1, 2, 3, 4, 5]);
  for (const area of ["aprender", "treinar", "kata"]) assert.equal(challenges.filter((item) => item.area === area).length, 5);
});
test("tipos ricos do desafio possuem dados necessarios", () => {
  const challenges = read("final-challenge.json");
  const types = new Set(challenges.map((item) => item.type));
  for (const type of ["MULTIPLE_CHOICE", "IMAGE_IDENTIFICATION", "VIDEO_IDENTIFICATION", "MATCHING", "ORDERING", "TRUE_FALSE"]) assert.equal(types.has(type), true, type);
});
test("catalogo de Treinar possui ficha completa e os videos enviados", () => {
  const content = read("training-content.json");
  const expectedTechniques = {
    "oi-zuki": "https://www.youtube.com/shorts/7eJsMxsRXhE", "gyaku-zuki": "https://www.youtube.com/shorts/oPGCVQEfz64",
    "mae-geri": "https://www.youtube.com/shorts/X-DBuUueSlA", "yoko-geri": "https://www.youtube.com/shorts/pteEV0eTaqI",
    "mawashi-geri": "https://www.youtube.com/shorts/uf5puVXoh38", "ushiro-geri": "https://www.youtube.com/shorts/0YIeG-haC34",
    "age-uke": "https://www.youtube.com/shorts/mgBSFPPhk58", "soto-uke": "https://www.youtube.com/shorts/n2UUI8u8CY4",
    "uchi-uke": "https://www.youtube.com/shorts/tJ9-_RN6jdM", "gedan-barai": "https://www.youtube.com/shorts/tiQ3mNAarkc",
    "shuto-uke": "https://www.youtube.com/shorts/pLTqW3BtGYA", "empi-uchi": "https://www.youtube.com/shorts/2sDfbtcW9Xg",
    "kizami-zuki": "https://www.youtube.com/watch?v=7zERNFwgu7Q", "tate-zuki": "https://www.youtube.com/watch?v=2bRhiFxCNt8",
    "uraken-uchi": "https://www.youtube.com/shorts/mMqWUKUDAGA", "nukite": "https://www.youtube.com/shorts/K_YAT97hvVc",
  };
  const expectedStances = {
    "heisoku-dachi": "https://www.youtube.com/shorts/DxU-I8AhGdg", "musubi-dachi": "https://www.youtube.com/shorts/DxU-I8AhGdg",
    "heiko-dachi": "https://www.youtube.com/shorts/DxU-I8AhGdg", "hachiji-dachi": "https://www.youtube.com/shorts/alqrL_VAMH8",
    "kosa-dachi": "https://www.youtube.com/shorts/yZat0R3iwk4", "kake-dachi": "https://www.youtube.com/shorts/cz-pW__H_NQ",
    "kiba-dachi": "https://www.youtube.com/shorts/UG8Tk8r7jgo", "shiko-dachi": "https://www.youtube.com/shorts/cmZqjifuKbw",
    "kokutsu-dachi": "https://www.youtube.com/shorts/bXETZTLiVc4", "neko-ashi-dachi": "https://www.youtube.com/shorts/w6WKjr84fZs",
    "zenkutsu-dachi": "https://www.youtube.com/shorts/107IUY7tP50", "fudo-dachi": "https://www.youtube.com/shorts/Ynes8BxsXO0",
    "sanchin-dachi": "https://www.youtube.com/shorts/DKJzlVxzPtw", "teiji-dachi": "https://www.youtube.com/watch?v=m7PLIneu1JE",
    "renoji-dachi": "https://www.youtube.com/shorts/nYdWPQ1O1cU",
  };
  for (const [id, url] of Object.entries(expectedTechniques)) {
    const item = content.techniques[id];
    assert.equal(item.videoUrl, url, id);
    for (const field of ["whatIs", "purpose", "technicalFocus", "practiceTips", "commonMistakes"]) assert.ok(item[field]?.length, `${id}.${field}`);
  }
  for (const [id, url] of Object.entries(expectedStances)) {
    const item = content.stances[id];
    assert.equal(item.videoUrl, url, id);
    for (const field of ["whatIs", "purpose", "technicalFocus", "practiceTips", "commonMistakes"]) assert.ok(item[field]?.length, `${id}.${field}`);
  }
  assert.equal(JSON.stringify(content).toLowerCase().includes("apostila"), false);
});
test("todos os assets locais do precache existem", () => {
  const prototypeDir = __dirname;
  const serviceWorker = fs.readFileSync(path.join(prototypeDir, "service-worker.js"), "utf8");
  const assetsBlock = serviceWorker.match(/const ASSETS = \[([\s\S]*?)\];/)[1];
  const assets = [...assetsBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  for (const asset of assets) assert.equal(fs.existsSync(path.resolve(prototypeDir, asset)), true, asset);
});
test("HTML carrega todos os modulos antes do app", () => {
  const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  assert.ok(html.indexOf("../../api.js") < html.indexOf("progress-service.js"), "API de autenticação e progresso deve carregar primeiro");
  const scripts = ["../../api.js", "progress-service.js", "certificate-pdf.js", "curriculum-engine.js", "learning-engine.js", "assessment-engine.js", "challenge-engine.js", "search-service.js", "gamification.js", "app.js"];
  let previous = -1;
  for (const script of scripts) {
    const index = html.indexOf(script);
    assert.ok(index > previous, script + " fora de ordem ou ausente");
    previous = index;
  }
});
test("guia exige login e usa o PWA principal sem persistir progresso localmente", () => {
  const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
  const progress = fs.readFileSync(path.join(__dirname, "progress-service.js"), "utf8");
  assert.equal(html.includes('rel="manifest"'), false, "não deve registrar um segundo PWA");
  assert.equal(html.includes('register("./service-worker.js")'), false, "deve usar o service worker da raiz");
  assert.match(app, /Auth\.exigirSessao\("aluno"\)/);
  assert.match(app, /ProgressService\.createRemote/);
  assert.equal(/\blocalStorage\b|\bsessionStorage\b/.test(progress), false, "o serviço de progresso não deve usar Storage local");
});
test("links de Estudos ficam nas abas Exame e Atarashii, e a página redireciona ao login raiz", () => {
  const root = path.resolve(__dirname, "../..");
  const login = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const student = fs.readFileSync(path.join(root, "area-associado.html"), "utf8");
  const api = fs.readFileSync(path.join(root, "api.js"), "utf8");
  assert.doesNotMatch(login, /href=["'][^"']*estudos\/prototype/);
  assert.match(student, /id="conteudo-programatico"[\s\S]*?href="estudos\/prototype\/"/);
  assert.match(api, /new URL\('index\.html', SITE_ROOT_URL\)/);
  assert.match(api, /\/api\/estudos\/progresso/);
  assert.ok(fs.existsSync(path.join(root, "database", "estudos_progresso.sql")));
  assert.match(student, /id="alertaPendenciasEstudos"/);
  assert.match(student, /EstudosRequisitos\.niveisObrigatorios\(faixa\)/);
  assert.match(student, /EstudosRequisitos\.niveisPendentes\(progresso, faixa\)/);
  assert.match(student, /class="btn-action"[^>]*>📚 Abrir Guia de Estudos/);
  assert.match(student, /id="saldo"[\s\S]*?📚 Abrir Guia de Estudos[\s\S]*?btnAbrirJogoCobrinha/);
  assert.ok(fs.existsSync(path.join(root, "api-render", "server.js")));
});

test("guia mostra nome do aluno, botão atualizar e retorno à área do associado", () => {
  const root = path.resolve(__dirname, "../..");
  const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
  assert.match(html, /<p class="eyebrow">Guia de estudo<\/p>[\s\S]*?<h1 id="studentName">/);
  assert.match(html, /id="refreshButton"/);
  assert.match(html, /href="\.\.\/\.\.\/area-associado\.html"/);
  assert.match(app, /studentName\.textContent = `Olá, \$\{currentUser\.nome/);
  assert.match(app, /refreshButton.*location\.reload/s);
  assert.ok(html.includes('certificate-pdf.js'));
  const requirements = require("../../estudos-requisitos.js");
  assert.deepEqual(requirements.niveisObrigatorios("Roxa"), ["basico", "intermediario", "avancado"]);
  const professor = fs.readFileSync(path.join(root, "professor.html"), "utf8");
  const api = fs.readFileSync(path.join(root, "api-render", "server.js"), "utf8");
  assert.match(professor, /mudarAba\('estudos', this\)/);
  assert.match(professor, /id="statusEstudosProfessor"/);
  assert.match(professor, /\/api\/professor\/estudos\/progresso/);
  assert.match(api, /app\.get\('\/api\/professor\/estudos\/progresso', autenticarToken, somenteProfessor/);
});
test("navegacao fixa mantém as quatro abas sem Contato nem cards duplicados na home", () => {
  const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  for (const route of ["home", "pilares", "progresso", "atarashii"]) {
    assert.match(html, new RegExp(`data-route="${route}"`), `${route} ausente da navegacao`);
  }
  assert.doesNotMatch(html, /data-route="contato"/);
  assert.equal((html.match(/class="tab(?: is-active)?"/g) || []).length, 4);
  const app = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
  const home = app.slice(app.indexOf("function homeView()"), app.indexOf("function pillarHubView()"));
  assert.equal(home.includes("institutional-grid"), false, "links institucionais duplicados na home");
});

test("cabeçalho do guia exibe somente atualizar e área do associado, com biografia atualizada", () => {
  const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  const header = html.slice(html.indexOf('<div class="topbar-actions">'), html.indexOf("</div>", html.indexOf('<div class="topbar-actions">')));
  assert.match(header, /id="refreshButton"/);
  assert.match(header, /Área do Associado/);
  assert.doesNotMatch(header, /progressButton|Progresso/);
  const app = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
  assert.match(app, /Tudo começou no final de 2002/);
  assert.match(app, /Em 2017, com muito esforço e dedicação/);
  assert.match(app, /Hoje, posso afirmar com o coração cheio: o Karatê é a minha vida/);
  assert.doesNotMatch(app, /progressButton/);
});

test("painel do associado mostra meses na faixa e diferencia o status dos estudos por cor", () => {
  const root = path.resolve(__dirname, "../..");
  const student = fs.readFileSync(path.join(root, "area-associado.html"), "utf8");
  const requirements = fs.readFileSync(path.join(root, "estudos-requisitos.js"), "utf8");
  assert.match(student, /id="tempoFaixaAtual"/);
  assert.match(student, /EstudosRequisitos\.mesesDesdePeriodo\(ultimo\?\.ano\)/);
  assert.match(student, /objetivo-estudos-pendente/);
  assert.match(student, /objetivo-estudos-concluido/);
  assert.match(student, /\.objetivo-estudos-pendente\s*\{\s*color:#f87171/);
  assert.match(student, /\.objetivo-estudos-concluido\s*\{\s*color:#86efac/);
  assert.match(requirements, /function mesesDesdePeriodo\(/);
});

test("jogo da cobrinha usa tela cheia, gestos, bombas por marco e resultado por partida", () => {
  const root = path.resolve(__dirname, "../..");
  const student = fs.readFileSync(path.join(root, "area-associado.html"), "utf8");
  assert.doesNotMatch(student, /data-snake-direcao|snake-controles/);
  assert.match(student, /requestFullscreen\(/);
  assert.match(student, /snake-em-tela-cheia/);
  assert.match(student, /addEventListener\('pointerup'/);
  assert.match(student, /setPointerCapture/);
  assert.match(student, /snakeDirecaoTravadaNoPasso/);
  assert.match(student, /id="snakeResultado"/);
  assert.match(student, /pontosGanhosNaPartida/);
  assert.match(student, /snakePontuacao % 3 === 0/);
  assert.match(student, /tentativa < 6/);
  assert.match(student, /snakeBombas.some/);
});
