import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import mammoth from 'mammoth';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import sharp from 'sharp';

const WordExtractor = require('word-extractor');

export interface UploadedDocument {
    originalname: string;
    mimetype: string;
    data: Buffer;
}

export class ConvertService {
    public async convertToPDF(file: UploadedDocument): Promise<Uint8Array> {
        const extension = path.extname(file.originalname).toLowerCase();

        if (file.mimetype === 'application/pdf' || extension === '.pdf') {
            return new Uint8Array(file.data);
        }

        if (file.mimetype.startsWith('image/')) {
            return this.convertImageToPDF(file.data, extension);
        }

        if (file.mimetype === 'text/plain' || extension === '.txt') {
            const textContent = file.data.toString('utf-8');
            return this.convertTextToPDF(textContent);
        }

        if (
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            extension === '.docx'
        ) {
            const { value } = await mammoth.extractRawText({ buffer: file.data });
            return this.convertTextToPDF(value || '(Documento vacio)');
        }

        if (file.mimetype === 'application/msword' || extension === '.doc') {
            return this.convertLegacyWordToPDF(file);
        }

        throw new Error(`Tipo de archivo no soportado: ${file.originalname}`);
    }

    private async convertLegacyWordToPDF(file: UploadedDocument): Promise<Uint8Array> {
        const tmpFilePath = path.join(os.tmpdir(), `${Date.now()}-${file.originalname}`);

        try {
            await fs.writeFile(tmpFilePath, file.data);
            const extractor = new WordExtractor();
            const extractedDoc = await extractor.extract(tmpFilePath);
            return this.convertTextToPDF(extractedDoc.getBody() || '(Documento vacio)');
        } finally {
            await fs.unlink(tmpFilePath).catch(() => undefined);
        }
    }

    private async convertImageToPDF(originalImageBytes: Buffer, extension: string): Promise<Uint8Array> {
        const pdfDoc = await PDFDocument.create();

        const isJpg = extension === '.jpg' || extension === '.jpeg';
        const isPng = extension === '.png';

        const image = isJpg
            ? await pdfDoc.embedJpg(originalImageBytes)
            : isPng
                ? await pdfDoc.embedPng(originalImageBytes)
                : await pdfDoc.embedPng(
                    await sharp(originalImageBytes, { animated: true })
                        .png({ quality: 100 })
                        .toBuffer()
                );

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
        });

        return pdfDoc.save();
    }

    private async convertTextToPDF(text: string): Promise<Uint8Array> {
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const pageWidth = 595;
        const pageHeight = 842;
        const margin = 48;
        const fontSize = 11;
        const lineHeight = 16;
        const maxTextWidth = pageWidth - margin * 2;

        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let cursorY = pageHeight - margin;

        const lines = this.wrapText(text.replace(/\r\n/g, '\n'), font, fontSize, maxTextWidth);

        for (const line of lines) {
            if (cursorY < margin) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                cursorY = pageHeight - margin;
            }

            page.drawText(line, {
                x: margin,
                y: cursorY,
                size: fontSize,
                font,
            });
            cursorY -= lineHeight;
        }

        return pdfDoc.save();
    }

    private wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
        const rawLines = text.split('\n');
        const wrapped: string[] = [];

        for (const rawLine of rawLines) {
            const words = rawLine.split(/\s+/).filter(Boolean);

            if (words.length === 0) {
                wrapped.push('');
                continue;
            }

            let currentLine = words[0];

            for (let index = 1; index < words.length; index += 1) {
                const candidate = `${currentLine} ${words[index]}`;
                const candidateWidth = font.widthOfTextAtSize(candidate, fontSize);

                if (candidateWidth <= maxWidth) {
                    currentLine = candidate;
                } else {
                    wrapped.push(currentLine);
                    currentLine = words[index];
                }
            }

            wrapped.push(currentLine);
        }

        return wrapped;
    }
}