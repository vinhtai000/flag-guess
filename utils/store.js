const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'flags.json');

const LEVEL_POINTS = { easy: 1, hard: 2 };

function readFlags() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeFlags(flags) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(flags, null, 2), 'utf-8');
}

function nextId(flags) {
  return flags.length ? Math.max(...flags.map(f => f.id)) + 1 : 1;
}

function pointsForLevel(level) {
  return LEVEL_POINTS[level] || 0;
}

module.exports = { readFlags, writeFlags, nextId, pointsForLevel, LEVEL_POINTS };
