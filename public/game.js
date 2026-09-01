let score = 0;
let streak = 0;

const questionArea = document.getElementById('questionArea');
const scoreDisplay = document.getElementById('scoreDisplay');
const streakDisplay = document.getElementById('streakDisplay');

function updateScoreBar() {
  scoreDisplay.textContent = `Score: ${score}`;
  streakDisplay.textContent = `Streak: ${streak}`;
}

async function loadQuestion() {
  questionArea.innerHTML = '<p>Loading...</p>';
  try {
    const res = await fetch('/api/game/question');
    const data = await res.json();

    if (!res.ok) {
      questionArea.innerHTML = `<p class="error-msg">${data.error || 'Failed to load question'}</p>`;
      return;
    }

    renderQuestion(data);
  } catch (err) {
    questionArea.innerHTML = '<p class="error-msg">Could not reach the server.</p>';
  }
}

function renderQuestion(question) {
  const levelClass = question.level === 'hard' ? 'level-hard' : 'level-easy';
  const levelLabel = question.level === 'hard' ? `Hard · ${question.points} pts` : `Easy · ${question.points} pt`;

  questionArea.innerHTML = `
    <span class="level-tag ${levelClass}">${levelLabel}</span>
    <img class="flag-img" src="${question.imageUrl}" alt="Guess this flag">
    <div class="options-grid" id="optionsGrid"></div>
    <div class="feedback" id="feedback"></div>
  `;

  const optionsGrid = document.getElementById('optionsGrid');
  question.options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.onclick = () => submitAnswer(question.flagId, option, btn);
    optionsGrid.appendChild(btn);
  });
}

async function submitAnswer(flagId, answer, clickedBtn) {
  const allButtons = document.querySelectorAll('.option-btn');
  allButtons.forEach(b => b.disabled = true);

  try {
    const res = await fetch('/api/game/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flagId, answer })
    });
    const result = await res.json();

    allButtons.forEach(b => {
      if (b.textContent === result.correctAnswer) b.classList.add('correct');
    });

    const feedback = document.getElementById('feedback');

    if (result.correct) {
      score += result.points;
      streak += 1;
      updateScoreBar();
      feedback.textContent = `Correct! +${result.points} point${result.points === 1 ? '' : 's'}`;
      feedback.style.color = '#4ade80';
      setTimeout(loadQuestion, 900);
    } else {
      clickedBtn.classList.add('wrong');
      feedback.textContent = `Wrong! It was ${result.correctAnswer}.`;
      feedback.style.color = '#f87171';
      setTimeout(showGameOver, 1200);
    }
  } catch (err) {
    document.getElementById('feedback').textContent = 'Something went wrong.';
  }
}

function showGameOver() {
  questionArea.innerHTML = `
    <div class="game-over">
      <h2>Game Over</h2>
      <p>Final score: <strong>${score}</strong> (streak of ${streak} correct)</p>
      <button class="btn-primary" onclick="restartGame()">Play Again</button>
    </div>
  `;
}

function restartGame() {
  score = 0;
  streak = 0;
  updateScoreBar();
  loadQuestion();
}

updateScoreBar();
loadQuestion();
