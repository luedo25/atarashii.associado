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
  const scripts = ["progress-service.js", "learning-engine.js", "assessment-engine.js", "challenge-engine.js", "search-service.js", "gamification.js", "app.js"];
  let previous = -1;
  for (const script of scripts) {
    const index = html.indexOf(script);
    assert.ok(index > previous, script + " fora de ordem ou ausente");
    previous = index;
  }
});
