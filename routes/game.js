const express = require('express');
const router = express.Router();
const { readFlags, pointsForLevel } = require('../utils/store');

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// GET a random question: a flag image + 4 country options (1 correct, 3 distractors)
router.get('/question', (req, res) => {
  const flags = readFlags();

  if (flags.length < 4) {
    return res.status(400).json({ error: 'Need at least 4 flags configured to play' });
  }

  const correctFlag = flags[Math.floor(Math.random() * flags.length)];

  const distractorPool = flags.filter(f => f.id !== correctFlag.id);
  const distractors = shuffle(distractorPool).slice(0, 3);

  const options = shuffle([correctFlag, ...distractors]).map(f => f.country);

  res.json({
    flagId: correctFlag.id,
    imageUrl: `https://flagcdn.com/w320/${correctFlag.code}.png`,
    level: correctFlag.level,
    points: pointsForLevel(correctFlag.level),
    options
  });
});

// POST an answer for a given flagId: { flagId, answer }
router.post('/answer', (req, res) => {
  const { flagId, answer } = req.body;
  if (flagId === undefined || !answer) {
    return res.status(400).json({ error: 'flagId and answer are required' });
  }

  const flags = readFlags();
  const flag = flags.find(f => f.id === Number(flagId));
  if (!flag) return res.status(404).json({ error: 'Flag not found' });

  const correct = flag.country.toLowerCase() === String(answer).toLowerCase();
  const points = correct ? pointsForLevel(flag.level) : 0;

  res.json({
    correct,
    points,
    correctAnswer: flag.country
  });
});

module.exports = router;
