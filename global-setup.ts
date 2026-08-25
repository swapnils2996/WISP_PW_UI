import fs from 'fs';
import path from 'path';

export default async function globalSetup() {
  const resultsDir = path.join(__dirname, 'allure-results');
  if (fs.existsSync(resultsDir)) {
    fs.rmSync(resultsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(resultsDir);
}
