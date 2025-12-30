// Main game logic
let correctCount = 0;
let totalCount = 0;
let currentQuestion = null;

// Helper functions
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Record answer locally
function recordAnswer(isCorrect) {
  totalCount++;
  if (isCorrect) correctCount++;
  document.getElementById('score').innerText = `${TEXTS.score} ${correctCount} / ${totalCount}`;
}

// Generate a question
function generateQuestion() {
  const questionType = Math.random() < 0.5 ? 'mostPopularName' : 'mostPopularYear';
  if (questionType === 'mostPopularName') {
    const year = Math.floor(Math.random() * (2023 - 2002 + 1)) + 2002;
    const pool = namesData.filter(d => d.year === year);
    const correct = randomItem(pool);
    const distractors = pool.filter(d => Math.abs(d.count - correct.count) < 300 && d.name !== correct.name);
    const options = shuffle([correct, randomItem(distractors), randomItem(distractors)]);
    
    currentQuestion = { type: 'yearName', year, correct, options };
    document.getElementById('question').innerText = `${TEXTS.questionMostPopularName} ${year}?`;
    options.forEach((opt, i) => {
      document.getElementById(`option${i}`).innerText = opt.name;
    });

  } else { // mostPopularYear
    const namePool = Array.from(new Set(namesData.map(d => d.name)));
    const name = randomItem(namePool);
    const pool = namesData.filter(d => d.name === name);
    const correct = pool.reduce((a, b) => (a.count > b.count ? a : b));
    const distractors = pool.filter(d => d.year !== correct.year);
    const options = shuffle([
      correct,
      randomItem(distractors),
      randomItem(distractors)
    ]);
    
    currentQuestion = { type: 'nameYear', name, correct, options };
    document.getElementById('question').innerText = `${TEXTS.questionMostPopularYear} ${name}?`;
    options.forEach((opt, i) => {
      document.getElementById(`option${i}`).innerText = opt.year;
    });
  }
}

// Handle user's click
function handleOptionClick(index) {
  const selected = currentQuestion.options[index];
  let isCorrect = false;

  if (currentQuestion.type === 'yearName') {
    isCorrect = selected.name === currentQuestion.correct.name;
  } else {
    isCorrect = selected.year === currentQuestion.correct.year;
  }

  recordAnswer(isCorrect);
  document.getElementById('feedback').innerText = isCorrect
    ? TEXTS.correct
    : `${TEXTS.incorrect}. ${TEXTS.answerWas} ${currentQuestion.correct.count}`;
}

// Initialize buttons and next question
function initGame() {
  for (let i = 0; i < 3; i++) {
    document.getElementById(`option${i}`).addEventListener('click', () => handleOptionClick(i));
  }
  document.getElementById('nextButton').addEventListener('click', () => {
    document.getElementById('feedback').innerText = '';
    generateQuestion();
  });

  loadData().then(generateQuestion);
}

window.onload = initGame;
