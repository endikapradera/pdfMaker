"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mergeRoutes_1 = require("./routes/mergeRoutes");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
const clientPath = path_1.default.resolve(process.cwd(), 'src/client');
const uploadsPath = path_1.default.resolve(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsPath)) {
    fs_1.default.mkdirSync(uploadsPath, { recursive: true });
}
app.use(express_1.default.static(clientPath));
(0, mergeRoutes_1.setMergeRoutes)(app);
app.get('/', (_req, res) => {
    res.sendFile(path_1.default.join(clientPath, 'index.html'));
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
