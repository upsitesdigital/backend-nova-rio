declare module 'svg-to-pdfkit' {
  function SVGtoPDFKit(
    doc: PDFKit.PDFDocument,
    svg: string,
    x: number,
    y: number,
    options?: {
      width?: number;
      height?: number;
      preserveAspectRatio?: string;
      useCSS?: boolean;
    },
  ): void;
  export default SVGtoPDFKit;
}
