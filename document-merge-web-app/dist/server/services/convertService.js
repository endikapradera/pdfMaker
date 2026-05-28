"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvertService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const mammoth_1 = __importDefault(require("mammoth"));
const pdf_lib_1 = require("pdf-lib");
const sharp_1 = __importDefault(require("sharp"));
const WordExtractor = require('word-extractor');
class ConvertService {
    convertToPDF(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const extension = path_1.default.extname(file.originalname).toLowerCase();
            if (file.mimetype === 'application/pdf' || extension === '.pdf') {
                return new Uint8Array(yield promises_1.default.readFile(file.path));
            }
            if (file.mimetype.startsWith('image/')) {
                return this.convertImageToPDF(file.path, extension);
            }
            if (file.mimetype === 'text/plain' || extension === '.txt') {
                const textContent = yield promises_1.default.readFile(file.path, 'utf-8');
                return this.convertTextToPDF(textContent);
            }
            if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                extension === '.docx') {
                const { value } = yield mammoth_1.default.extractRawText({ path: file.path });
                return this.convertTextToPDF(value || '(Documento vacio)');
            }
            if (file.mimetype === 'application/msword' || extension === '.doc') {
                const extractor = new WordExtractor();
                const extractedDoc = yield extractor.extract(file.path);
                return this.convertTextToPDF(extractedDoc.getBody() || '(Documento vacio)');
            }
            throw new Error(`Tipo de archivo no soportado: ${file.originalname}`);
        });
    }
    convertImageToPDF(imagePath, extension) {
        return __awaiter(this, void 0, void 0, function* () {
            const originalImageBytes = yield promises_1.default.readFile(imagePath);
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const isJpg = extension === '.jpg' || extension === '.jpeg';
            const isPng = extension === '.png';
            const image = isJpg
                ? yield pdfDoc.embedJpg(originalImageBytes)
                : isPng
                    ? yield pdfDoc.embedPng(originalImageBytes)
                    : yield pdfDoc.embedPng(yield (0, sharp_1.default)(originalImageBytes, { animated: true })
                        .png({ quality: 100 })
                        .toBuffer());
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            });
            return pdfDoc.save();
        });
    }
    convertTextToPDF(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const font = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
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
        });
    }
    wrapText(text, font, fontSize, maxWidth) {
        const rawLines = text.split('\n');
        const wrapped = [];
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
                }
                else {
                    wrapped.push(currentLine);
                    currentLine = words[index];
                }
            }
            wrapped.push(currentLine);
        }
        return wrapped;
    }
}
exports.ConvertService = ConvertService;
