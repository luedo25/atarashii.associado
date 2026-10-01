(function (root) {
  "use strict";

  const encoder = new TextEncoder();
  const ascii = (value) => encoder.encode(value);

  function joinBytes(parts) {
    const size = parts.reduce((sum, part) => sum + part.length, 0);
    const output = new Uint8Array(size);
    let offset = 0;
    for (const part of parts) {
      output.set(part, offset);
      offset += part.length;
    }
    return output;
  }

  function pdfFromJpeg(jpeg, imageWidth, imageHeight) {
    if (!(jpeg instanceof Uint8Array) || !jpeg.length || !Number.isInteger(imageWidth) || imageWidth < 1 || !Number.isInteger(imageHeight) || imageHeight < 1) {
      throw new TypeError("A imagem do certificado não está em um formato válido.");
    }

    const content = "q 595.28 0 0 841.89 0 0 cm /Im0 Do Q";
    const objects = [
      ascii("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"),
      ascii("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"),
      ascii("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n"),
      joinBytes([
        ascii(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`),
        jpeg,
        ascii("\nendstream\nendobj\n"),
      ]),
      ascii(`5 0 obj\n<< /Length ${ascii(content).length} >>\nstream\n${content}\nendstream\nendobj\n`),
    ];

    const parts = [ascii("%PDF-1.4\n")];
    const offsets = [0];
    let length = parts[0].length;
    for (const object of objects) {
      offsets.push(length);
      parts.push(object);
      length += object.length;
    }
    const xrefOffset = length;
    const xref = ["xref\n0 6\n", "0000000000 65535 f \n"];
    for (let index = 1; index < offsets.length; index += 1) {
      xref.push(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
    }
    xref.push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
    parts.push(ascii(xref.join("")));
    return joinBytes(parts);
  }

  const api = { pdfFromJpeg };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CertificatePdf = api;
})(typeof window !== "undefined" ? window : globalThis);
