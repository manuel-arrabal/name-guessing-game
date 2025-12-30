// game.js
// English comments & code, Spanish front-end via ui.js

// namesData is global, loaded from dataLoader.js
let currentQuestion = null;
let score = 0;
let totalQuestions = 0;

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Initialize the game after data is loaded
function initGame() {
  if (!namesData || namesData.length === 0) {
    console.error("No data loaded");
    return;
  }
  score = 0;
  totalQuestions = 0;

  // Attach button listeners
  for (let i = 0; i < 3; i++) {
    document.getElementById(`option${i}`).onclick = () => checkAnswer(i);
  }

  generateQuestion();
}

// Generate random question type
function generateQuestion() {
  const type = Math.random() < 0.5 ? 'popularName' : 'mostPopularYear';
  if (type === 'popularName') {
    generatePopularNameQuestion();
  } else {
    generateMostPopularYearQuestion();
  }
}

// Question: Most popular name in a given year
function generatePopularNameQuestion() {
  const years = [...new Set(namesData.map(d => d.year))];
  const year = randomItem(years);
  const gender = randomItem(['M','F']);
  const pool = namesData.filter(d => d.year === year && d.gender === gender);
  if (pool.length < 3) return generateQuestion();

  const correct = randomItem(pool);
  const distractors = pool.filter(d => d.name !== correct.name && Math.abs(d.count - correct.count) < 2000);
  const options = shuffle([correct, randomItem(distractors), randomItem(distractors)]);
  currentQuestion = { type:'popularName', year, gender, correct, options };

  document.getElementById('question').innerText = formatString(
    UI_STRINGS.questionPopularName,
    { year }
  );

  options.forEach((opt,i) => {
    document.getElementById(`option${i}`).innerText = opt.name;
  });

  document.getElementById('feedback').innerText = '';
}

// Question: Year in which a name was most popular
function generateMostPopularYearQuestion() {
  const names = [...new Set(namesData.map(d => d.name))];
  const name = randomItem(names);
  const pool = namesData.filter(d => d.name === name);
  const correct = pool.reduce((a,b) => a.count > b.count ? a : b);
  const options = shuffle([correct, randomItem(pool), randomItem(pool)]);
  currentQuestion = { type:'mostPopularYear', name, correct, options };

  document.getElementById('question').innerText = formatString(
    UI_STRINGS.questionMostPopularYear,
    { name }
  );

  options.forEach((opt,i) => {
    document.getElementById(`option${i}`).innerText = opt.year;
  });

  document.getElementById('feedback').innerText = '';
}

// Check user's answer
function checkAnswer(index) {
  const selected = currentQuestion.options[index];
  let isCorrect = false;

  if (currentQuestion.type === 'popularName') {
    isCorrect = selected.name === currentQuestion.correct.name;
  } else {
    isCorrect = selected.year === currentQuestion.correct.year;
  }

  totalQuestions++;
  if(isCorrect) score++;

  document.getElementById('feedback').innerText = isCorrect
    ? UI_STRINGS.correct
    : formatString(UI_STRINGS.incorrect, {
        answer: currentQuestion.type==='popularName'
          ? currentQuestion.correct.name
          : currentQuestion.correct.year,
        count: currentQuestion.correct.count
      });

  document.getElementById('score').innerText = formatString(UI_STRINGS.score, {
    score,
    total: totalQuestions
  });

  setTimeout(generateQuestion, 1500);
}

// Start game after CSV is loaded
loadData().then(initGame);
