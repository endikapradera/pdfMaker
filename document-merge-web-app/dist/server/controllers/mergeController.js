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
exports.MergeController = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const mergeService_1 = require("../services/mergeService");
const convertService_1 = require("../services/convertService");
class MergeController {
    constructor() {
        this.mergeDocuments = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const files = req.files || [];
            try {
                if (files.length === 0) {
                    res.status(400).json({ message: 'Debes subir al menos un archivo.' });
                    return;
                }
                const pdfBuffers = yield Promise.all(files.map((file) => this.convertService.convertToPDF(file)));
                const mergedPdf = yield this.mergeService.mergePDFs(pdfBuffers);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename="documento-unido.pdf"');
                res.status(200).send(Buffer.from(mergedPdf));
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Error inesperado';
                res.status(500).json({ message: `Error al unir documentos: ${message}` });
            }
            finally {
                yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield promises_1.default.unlink(file.path);
                    }
                    catch (_a) {
                        // Ignore cleanup errors.
                    }
                })));
            }
        });
        this.mergeService = new mergeService_1.MergeService();
        this.convertService = new convertService_1.ConvertService();
    }
}
exports.MergeController = MergeController;
