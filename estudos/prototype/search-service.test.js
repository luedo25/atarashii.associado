const test = require("node:test");
const assert = require("node:assert/strict");
const Search = require("./search-service.js");

const items = [
  { id: "1", domain: "Técnicas", searchData: { title: "Gyaku-Zuki", description: "Soco reverso", steps: ["Rotação do quadril"] } },
  { id: "2", domain: "Glossário", searchData: { term: "Mokuso", meaning: "Pensar em silêncio" } },
  { id: "3", domain: "Katas", searchData: { nome: "Heian Shodan", nome_japones: "平安初段" } },
];
test("normaliza acentos, caixa e espacos", () => assert.equal(Search.normalize("  TÉCNICA  "), "tecnica"));
test("busca titulo, descricao, passos e termos japoneses", () => {
  assert.equal(Search.search(items, "gyaku").Técnicas[0].id, "1");
  assert.equal(Search.search(items, "rotacao").Técnicas[0].id, "1");
  assert.equal(Search.search(items, "silencio").Glossário[0].id, "2");
  assert.equal(Search.search(items, "平安").Katas[0].id, "3");
});
test("agrupa resultados por dominio", () => assert.ok(Object.keys(Search.search(items, "a")).length >= 2));
