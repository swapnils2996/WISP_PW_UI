const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const reportsDir = path.join(__dirname, 'allure-reports');
const resultsDir = path.join(__dirname, 'allure-results');
const allureBin  = path.join(__dirname, 'node_modules', 'allure-commandline', 'bin', 'allure');

// Optional folder name: node generate-allure-report.js "Sprint_42"
// Falls back to "latest" if no name is provided
const folderName = process.argv[2] || 'latest';
const reportDir  = path.join(reportsDir, folderName);

fs.mkdirSync(reportsDir, { recursive: true });

try {
  execSync(`node "${allureBin}" generate "${resultsDir}" -o "${reportDir}" --clean`, { stdio: 'inherit' });
  console.log(`\nAllure report saved to: ${reportDir}`);
} catch (e) {
  console.error('Failed to generate allure report:', e.message);
  process.exit(1);
}
