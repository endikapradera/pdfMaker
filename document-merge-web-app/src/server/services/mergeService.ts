import { PDFDocument } from 'pdf-lib';

export class MergeService {
    public async mergePDFs(pdfDocuments: Uint8Array[]): Promise<Uint8Array> {
        const mergedPdf = await PDFDocument.create();

        for (const pdfBytes of pdfDocuments) {
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        return mergedPdf.save();
    }
}