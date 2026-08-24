import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'images');
const destDir = path.join(__dirname, 'public', 'assets');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const filesToCopy = [
  { src: 'layer1_genai.jpeg', dest: 'layer1_genai.jpeg' },
  { src: 'layer1_manual.jpeg', dest: 'layer1_manual.jpeg' },
  { src: 'layer2_genai.png', dest: 'layer2_genai.png' },
  { src: 'layer2_manual.png', dest: 'layer2_manual.png' }
];

filesToCopy.forEach(({ src, dest }) => {
  const srcPath = path.join(srcDir, src);
  const destPath = path.join(destDir, dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${src} to public/assets/${dest}`);
  } else {
    console.warn(`Warning: ${srcPath} does not exist`);
  }
});
