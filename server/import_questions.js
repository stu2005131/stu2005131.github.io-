// Usage: node import_questions.js data.json
const fs = require('fs');
const path = require('path');

const src = process.argv[2];
if (!src) {
  console.log('Usage: node import_questions.js data.json');
  process.exit(1);
}
const input = JSON.parse(fs.readFileSync(src));
const dstPath = path.join(__dirname, 'data', 'questions.json');
let existing = [];
if (fs.existsSync(dstPath)) {
  existing = JSON.parse(fs.readFileSync(dstPath));
}
let id = existing.length + 1;
input.forEach(q => {
  existing.push({id: id++, text: q.question, answer: q.answer, tags: q.tags || []});
});
fs.writeFileSync(dstPath, JSON.stringify(existing, null, 2));
console.log('Imported', input.length, 'questions.');
