const express = require('express');
const router = express.Router();
const { readFlags, writeFlags, nextId, pointsForLevel } = require('../utils/store');

const VALID_LEVELS = ['easy', 'hard'];

// GET all flags
router.get('/flags', (req, res) => {
  const flags = readFlags();
  const withPoints = flags.map(f => ({ ...f, points: pointsForLevel(f.level) }));
  res.json(withPoints);
});

// GET single flag
router.get('/flags/:id', (req, res) => {
  const flags = readFlags();
  const flag = flags.find(f => f.id === Number(req.params.id));
  if (!flag) return res.status(404).json({ error: 'Flag not found' });
  res.json({ ...flag, points: pointsForLevel(flag.level) });
});

// CREATE flag
router.post('/flags', (req, res) => {
  const { country, code, level } = req.body;

  if (!country || !code || !level) {
    return res.status(400).json({ error: 'country, code, and level are required' });
  }
  if (!VALID_LEVELS.includes(level)) {
    return res.status(400).json({ error: `level must be one of: ${VALID_LEVELS.join(', ')}` });
  }

  const flags = readFlags();
  const newFlag = {
    id: nextId(flags),
    country: country.trim(),
    code: code.trim().toLowerCase(),
    level
  };
  flags.push(newFlag);
  writeFlags(flags);
  res.status(201).json({ ...newFlag, points: pointsForLevel(newFlag.level) });
});

// UPDATE flag
router.put('/flags/:id', (req, res) => {
  const id = Number(req.params.id);
  const flags = readFlags();
  const idx = flags.findIndex(f => f.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Flag not found' });

  const { country, code, level } = req.body;
  if (level && !VALID_LEVELS.includes(level)) {
    return res.status(400).json({ error: `level must be one of: ${VALID_LEVELS.join(', ')}` });
  }

  flags[idx] = {
    ...flags[idx],
    ...(country && { country: country.trim() }),
    ...(code && { code: code.trim().toLowerCase() }),
    ...(level && { level })
  };
  writeFlags(flags);
  res.json({ ...flags[idx], points: pointsForLevel(flags[idx].level) });
});

// DELETE flag
router.delete('/flags/:id', (req, res) => {
  const id = Number(req.params.id);
  const flags = readFlags();
  const idx = flags.findIndex(f => f.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Flag not found' });

  const [removed] = flags.splice(idx, 1);
  writeFlags(flags);
  res.json({ deleted: removed });
});

module.exports = router;
