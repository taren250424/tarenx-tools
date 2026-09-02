declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: Record<string, unknown>;
    jsPDF?: Record<string, unknown>;
    pagebreak?: {
      mode?: string | string[];
      before?: string;
      after?: string;
      avoid?: string;
    };
    enableLinks?: boolean;
  }

  interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance;
    from(source: HTMLElement | string): Html2PdfInstance;
    toCanvas(): Html2PdfInstance;
    get(key: "canvas"): Promise<HTMLCanvasElement>;
    save(): Promise<void>;
  }

  export default function html2pdf(): Html2PdfInstance;
}
