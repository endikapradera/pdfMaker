import express from 'express';
import fs from 'fs';
import path from 'path';
import { setMergeRoutes } from './routes/mergeRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const clientPath = path.resolve(process.cwd(), 'src/client');
const uploadsPath = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(express.static(clientPath));

setMergeRoutes(app);

app.get('/', (_req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});