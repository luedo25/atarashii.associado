const test = require("node:test");
const assert = require("node:assert/strict");
const Requirements = require("../../estudos-requisitos.js");

test("faixas branca, amarela e vermelha exigem somente o pilar Básico", () => {
  for (const faixa of ["Branca", "Amarela", "Vermelha"]) {
    assert.deepEqual(Requirements.niveisObrigatorios(faixa), ["basico"]);
  }
});

test("faixas laranja e verde exigem os pilares Básico e Intermediário", () => {
  for (const faixa of ["Laranja", "Verde"]) {
    assert.deepEqual(Requirements.niveisObrigatorios(faixa), ["basico", "intermediario"]);
  }
});

test("faixa roxa exige até Avançado e marrom/preta exigem os quatro pilares", () => {
  assert.deepEqual(Requirements.niveisObrigatorios("Roxa"), ["basico", "intermediario", "avancado"]);
  assert.deepEqual(Requirements.niveisObrigatorios("Marrom"), ["basico", "intermediario", "avancado", "especialista"]);
  assert.deepEqual(Requirements.niveisObrigatorios("Preta"), ["basico", "intermediario", "avancado", "especialista"]);
});

test("faixa com duas cores considera a última graduação e mostra a faixa seguinte", () => {
  assert.equal(Requirements.normalizarFaixa("Verde/Roxa"), "Roxa");
  assert.equal(Requirements.proximaFaixa("Vermelha"), "Laranja");
  assert.equal(Requirements.proximaFaixa("Marrom"), "Preta");
});

test("pendências mostram apenas níveis exigidos que não foram aprovados", () => {
  const progresso = { assessments: { "pilar-basico": { passed: true }, "pilar-intermediario": { passed: false } } };
  assert.deepEqual(Requirements.niveisPendentes(progresso, "Laranja"), ["intermediario"]);
  assert.deepEqual(Requirements.niveisPendentes(progresso, "Branca"), []);
});

test("calcula os meses completos na faixa usando o período do último exame", () => {
  const hoje = new Date(2026, 9, 1);
  assert.equal(Requirements.mesesDesdePeriodo("Junho / 2025", hoje), 16);
  assert.equal(Requirements.mesesDesdePeriodo("2025-06", hoje), 16);
  assert.equal(Requirements.mesesDesdePeriodo("10/2026", hoje), 0);
  assert.equal(Requirements.mesesDesdePeriodo("período não informado", hoje), null);
});
