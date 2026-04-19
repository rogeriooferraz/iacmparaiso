const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const targetPath = path.join(rootDir, 'assets', 'js', 'events-data.js');

function validateEvents(events) {
  if (!Array.isArray(events)) {
    throw new Error('assets/js/events-data.js must assign an array to window.EVENTS_DATA.');
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
  if (!fs.existsSync(targetPath)) {
    throw new Error('assets/js/events-data.js was not found.');
  }

  const source = fs.readFileSync(targetPath, 'utf8');
  const match = source.match(/window\.EVENTS_DATA\s*=\s*Object\.freeze\(([\s\S]*?)\);?\s*$/);

  if (!match) {
    throw new Error('assets/js/events-data.js must export data as window.EVENTS_DATA = Object.freeze([...]);');
  }

  const events = Function(`"use strict"; return (${match[1]});`)();
  validateEvents(events);
  console.log(`${targetPath} OK (${events.length} event${events.length === 1 ? '' : 's'})`);
}

main();
