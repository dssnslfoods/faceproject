// @ts-expect-error - html2pdf.js has no types
import html2pdf from "html2pdf.js";

export function exportToPdf(elementId: string, filename: string) {
  const el = document.getElementById(elementId);
  if (!el) return;
  html2pdf()
    .set({
      margin: 10,
      filename,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: { scale: 2, backgroundColor: "#050816", useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(el)
    .save();
}
