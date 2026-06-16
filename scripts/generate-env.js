const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const outputPath = path.resolve(__dirname, '../src/env.js');

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  const variables = {};

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      if (key && values.length > 0) {
        variables[key.trim()] = values.join('=').trim();
      }
    }
  });

  const jsContent = `// Automatically generated from .env - DO NOT EDIT MANUALLY\n\n` +
    Object.entries(variables)
      .map(([key, value]) => `export const ${key} = '${value}';`)
      .join('\n') + '\n';

  fs.writeFileSync(outputPath, jsContent);
  console.log('✅ successfully generated src/env.js');
} catch (error) {
  console.error('❌ Failed to generate src/env.js:', error.message);
  process.exit(1);
}
