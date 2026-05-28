"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMergeRoutes = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const mergeController_1 = require("../controllers/mergeController");
const router = (0, express_1.Router)();
const mergeController = new mergeController_1.MergeController();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.post('/', upload.array('files', 50), mergeController.mergeDocuments.bind(mergeController));
function setMergeRoutes(app) {
    app.use('/api/merge', router);
}
exports.setMergeRoutes = setMergeRoutes;
