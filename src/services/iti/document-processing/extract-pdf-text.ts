import "server-only";

export async function extractPdfEmbeddedText(buffer: Buffer) {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });

  try {
    const info = await parser.getInfo();
    const textResult = await parser.getText();

    return {
      text: textResult.text?.trim() ?? "",
      pageCount: info.total ?? textResult.total ?? 1,
    };
  } finally {
    await parser.destroy();
  }
}
