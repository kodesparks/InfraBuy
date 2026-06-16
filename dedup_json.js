const fs = require('fs');
const path = require('path');

function dedupJson(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Use a simple approach: parse and stringify. Since JS objects can't have duplicate keys,
        // JSON.parse automatically keeps the last occurrence of any duplicate key.
        const parsed = JSON.parse(content);

        fs.writeFileSync(filePath, JSON.stringify(parsed, null, 4), 'utf8');
        console.log(`Successfully deduplicated ${filePath}`);
    } catch (e) {
        console.error(`Error processing ${filePath}: ${e.message}`);
    }
}

dedupJson('C:/Users/Rohit/Infrabuy/InfraBuy/src/locales/en.json');
dedupJson('C:/Users/Rohit/Infrabuy/InfraBuy/src/locales/te.json');
