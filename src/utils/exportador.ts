import { toJpeg, toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

// exportar como imagen
export async function exportarComoImagen(
  elemento: HTMLElement,
  nombreArchivo: string,
  formato: 'jpg' | 'png' = 'png',
  colorFondo: string = '#090d16'
) {
  const opciones = {
    quality: 0.98,
    backgroundColor: colorFondo,
    pixelRatio: 2,
  };

  const dataUrl =
    formato === 'png'
      ? await toPng(elemento, opciones)
      : await toJpeg(elemento, opciones);

  const link = document.createElement('a');
  link.download = `${nombreArchivo}.${formato}`;
  link.href = dataUrl;
  link.click();
}

// exportar como PDF
export async function exportarComoPdf(
  elemento: HTMLElement,
  nombreArchivo: string,
  colorFondo: string = '#090d16'
) {
  const dataUrl = await toPng(elemento, {
    quality: 1,
    backgroundColor: colorFondo,
    pixelRatio: 2,
  });

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const imgProps = pdf.getImageProperties(dataUrl);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  const marginY = pdfHeight < 210 ? (210 - pdfHeight) / 2 : 0;

  pdf.addImage(dataUrl, 'PNG', 0, marginY, pdfWidth, pdfHeight);
  pdf.save(`${nombreArchivo}.pdf`);
}