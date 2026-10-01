const test = require("node:test");
const assert = require("node:assert/strict");
const { pdfFromJpeg } = require("./certificate-pdf.js");

test("certificado PDF tem página A4 e inclui a imagem de alta resolução", () => {
  const image = Uint8Array.from([0xff, 0xd8, 0xff, 0xd9]);
  const pdf = Buffer.from(pdfFromJpeg(image, 2480, 3508));
  assert.equal(pdf.subarray(0, 8).toString("ascii"), "%PDF-1.4");
  const source = pdf.toString("latin1");
  assert.match(source, /\/MediaBox \[0 0 595\.28 841\.89\]/);
  assert.match(source, /\/Width 2480 \/Height 3508/);
  const startxref = Number(source.match(/startxref\n(\d+)/)?.[1]);
  assert.equal(pdf.subarray(startxref, startxref + 4).toString("ascii"), "xref");
});

test("certificado rejeita imagem vazia ou sem dimensões", () => {
  assert.throws(() => pdfFromJpeg(new Uint8Array(), 2480, 3508), /formato válido/);
  assert.throws(() => pdfFromJpeg(Uint8Array.from([1]), 0, 3508), /formato válido/);
});
