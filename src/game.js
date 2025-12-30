// game.js
// Core logic for Spanish Baby Name Guessing Game
// English comments; front-end texts in Spanish in ui.js

let currentQuestion = null;
let score = 0;
let totalQuestions = 0;

// Utility: shuffle array
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Pick a random item from an array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate next question
function generateQuestion() {
  const questionType = Math.random() < 0.5 ? 'popularName' : 'nameYear';

  if (questionType === 'popularName') {
    generatePopularNameQuestion();
  } else {
    generateMostPopularYearQuestion();
  }
}

// Question type 1: Which name was most popular in a given year?
function generatePopularNameQuestion() {
  const year = randomItem([...new Set(namesData.map(d => d.year))]);
  const gender = randomItem(['M', 'F']);
  const pool = namesData.filter(d => d.year === year && d.gender === gender);

  const correct = randomItem(pool);

  // distractors: close count, same year & gender
  const distractors = pool.filter(
    d => d.name !== correct.name && Math.abs(d.count - correct.count) < 2000
  );

  const options = shuffle([correct, randomItem(distractors), randomItem(distractors)]);

  currentQuestion = { type: 'popularName', year, gender, correct, options };

  // Update UI
  document.getElementById('question').innerText =
    `${TEXTS.questionMostPopularInYear} ${year} (${gender === 'M' ? TEXTS.male : TEXTS.female})?`;

  options.forEach((opt, i) => {
    document.getElementById(`option${i}`).innerText = opt.name;
  });
}

// Question type 2: In which year was this name most popular?
function generateMostPopularYearQuestion() {
  let name = null;
  let pool = [];

  const availableNames = namesData.map(d => d.name);

  // ensure the name has multiple years of data
  do {
    name = randomItem(availableNames);
    pool = namesData.filter(d => d.name === name);
  } while (pool.length < 2);

  const correct = pool.reduce((a, b) => (a.count > b.count ? a : b));

  // distractors: other years
  const distractors = pool.filter(d => d.year !== correct.year);
  const options = shuffle([correct, randomItem(distractors), randomItem(distractors)]);

  currentQuestion = { type: 'nameYear', name, correct, options };

  // Update UI
  document.getElementById('question').innerText =
    `${TEXTS.questionMostPopularYear} ${name}?`;

  options.forEach((opt, i) => {
    document.getElementById(`option${i}`).innerText = opt.year;
  });
}

// Handle user answer
function checkAnswer(index) {
  const selected = currentQuestion.options[index];
  let isCorrect = false;

  if (currentQuestion.type === 'popularName') {
    isCorrect = selected.name === currentQuestion.correct.name;
  } else if (currentQuestion.type === 'nameYear') {
    isCorrect = selected.year === currentQuestion.correct.year;
  }

  totalQuestions++;
  if (isCorrect) score++;

  // Update feedback
  document.getElementById('feedback').innerText = isCorrect
    ? TEXTS.correct
    : `${TEXTS.incorrect} ${TEXTS.answerWas} ${
        currentQuestion.type === 'popularName'
          ? currentQuestion.correct.name
          : currentQuestion.correct.year
      } (${currentQuestion.correct.count} ${TEXTS.births})`;

  // Update score display
  document.getElementById('score').innerText = `${TEXTS.score}: ${score} / ${totalQuestions}`;

  // Next question after short delay
  setTimeout(generateQuestion, 1500);
}

// Initialize game
function initGame() {
  // Attach event listeners to buttons
  for (let i = 0; i < 3; i++) {
    document.getElementById(`option${i}`).addEventListener('click', () => checkAnswer(i));
  }

  generateQuestion();
}
