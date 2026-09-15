import express from 'express';
import cors from 'cors';
import { uploadToImageKit, generateAuthParams, deleteFromImageKit } from './server/imagekitApi.js';
import { executeCodeOnPiston } from './server/executionApi.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so your Vercel frontend can call this backend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Accept JSON payloads up to 50MB (needed for image uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Permanent lightweight health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Health check endpoint (Render uses this to verify the server is live)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'code-meets-ai-backend', timestamp: new Date().toISOString() });
});

// Root ping
app.get('/', (req, res) => {
  res.send('Code Meets AI Backend is running!');
});

// 1. GET /api/imagekit/auth
app.get('/api/imagekit/auth', (req, res) => {
  try {
    const authParams = generateAuthParams();
    res.status(200).json(authParams);
  } catch (err) {
    console.error('[Server Error] /api/imagekit/auth:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. POST /api/imagekit/upload
app.post('/api/imagekit/upload', async (req, res) => {
  try {
    const { file, fileName, folder } = req.body;
    const result = await uploadToImageKit({
      base64Data: file,
      fileName,
      folder
    });
    res.status(200).json(result);
  } catch (err) {
    console.error('[Server Error] /api/imagekit/upload:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. POST /api/imagekit/delete
app.post('/api/imagekit/delete', async (req, res) => {
  try {
    const { fileIds } = req.body;
    const result = await deleteFromImageKit(fileIds || []);
    res.status(200).json(result);
  } catch (err) {
    console.error('[Server Error] /api/imagekit/delete:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. POST /api/execute (Judge0 code execution proxy)
app.post('/api/execute', async (req, res) => {
  try {
    const result = await executeCodeOnPiston(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error('[Server Error] /api/execute:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
