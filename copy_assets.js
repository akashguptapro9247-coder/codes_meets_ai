import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicAssetsDir = path.join(__dirname, 'public', 'assets');
const publicVediosDir = path.join(__dirname, 'public', 'vedios');

if (!fs.existsSync(publicAssetsDir)) {
  fs.mkdirSync(publicAssetsDir, { recursive: true });
}
if (!fs.existsSync(publicVediosDir)) {
  fs.mkdirSync(publicVediosDir, { recursive: true });
}

// Copy MP4 video
const srcVideo = path.join(__dirname, 'vedios', 'Human_and_robotic_hand_handshake_202608161113.mp4');
const destVideo1 = path.join(publicAssetsDir, 'code-meets-ai-handshake.mp4');
const destVideo2 = path.join(publicVediosDir, 'Human_and_robotic_hand_handshake_202608161113.mp4');

if (fs.existsSync(srcVideo)) {
  fs.copyFileSync(srcVideo, destVideo1);
  fs.copyFileSync(srcVideo, destVideo2);
  console.log('Video files successfully copied to public directory!');
}

// Copy JPG poster if exists in brain
const srcPoster = 'C:\\Users\\Akash\\.gemini\\antigravity\\brain\\84a9981f-e359-499c-b8c3-b0b96bd79576\\media__1786857077333.jpg';
const destPoster = path.join(publicAssetsDir, 'handshake-bg.jpg');

if (fs.existsSync(srcPoster)) {
  fs.copyFileSync(srcPoster, destPoster);
  console.log('Poster file successfully copied to public directory!');
}
