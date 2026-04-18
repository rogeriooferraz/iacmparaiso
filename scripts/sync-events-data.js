const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const sourcePath = path.join(rootDir, 'events', 'events.json');
const targetPath = path.join(rootDir, 'assets', 'js', 'events-data.js');

function sanitizeEvents(events) {
  if (!Array.isArray(events)) {
    throw new Error('events/events.json must contain a JSON array.');
  }

  return events.map((event, index) => {
    if (!event || typeof event.file !== 'string' || typeof event.title !== 'string') {
      throw new Error(`Invalid event entry at index ${index}. Expected "file" and "title" strings.`);
    }

    const file = event.file.trim();
    const title = event.title.trim();

    if (!file || !title) {
      throw new Error(`Invalid event entry at index ${index}. "file" and "title" cannot be empty.`);
    }

    return { file, title };
  });
}

function main() {
  let events = [];

  if (fs.existsSync(sourcePath)) {
    const source = fs.readFileSync(sourcePath, 'utf8').trim();
    events = source ? sanitizeEvents(JSON.parse(source)) : [];
  }

  const output = [
    'window.EVENTS_DATA = Object.freeze(',
    `${JSON.stringify(events, null, 2)}`,
    ');',
    ''
  ].join('\n');

  fs.writeFileSync(targetPath, output, 'utf8');
  console.log(targetPath);
}

main();
