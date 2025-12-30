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
    const questionEl = document.getElementById('question');
    if (questionEl) {
      questionEl.innerText = 'Error: No se pudieron cargar los datos. Por favor, recarga la página.';
    }
    return;
  }
  
  console.log('Initializing game with', namesData.length, 'data points');
  score = 0;
  totalQuestions = 0;

  // Attach button listeners
  for (let i = 0; i < 3; i++) {
    const btn = document.getElementById(`option${i}`);
    if (btn) {
      btn.onclick = () => checkAnswer(i);
    } else {
      console.error(`Button option${i} not found`);
    }
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
function generatePopularNameQuestion(attempts = 0) {
  if (attempts > 10) {
    console.error('Too many attempts to generate question');
    document.getElementById('question').innerText = 'Error al generar pregunta. Por favor, recarga la página.';
    return;
  }
  
  const years = [...new Set(namesData.map(d => d.year))];
  const year = randomItem(years);
  const gender = randomItem(['M','F']);
  const pool = namesData.filter(d => d.year === year && d.gender === gender);
  if (pool.length < 3) return generatePopularNameQuestion(attempts + 1);

  // Sort by count descending and get the most popular
  const sortedPool = [...pool].sort((a, b) => b.count - a.count);
  const correct = sortedPool[0];
  
  // Get distractors with similar popularity (within reasonable range)
  const distractors = sortedPool.slice(1).filter(d => 
    d.name !== correct.name && 
    Math.abs(d.count - correct.count) < correct.count * 0.5
  );
  
  if (distractors.length < 2) {
    // If not enough similar distractors, use any other names
    const otherNames = sortedPool.slice(1, 10);
    if (otherNames.length < 2) return generatePopularNameQuestion(attempts + 1);
    const options = shuffle([correct, otherNames[0], otherNames[1]]);
    currentQuestion = { type:'popularName', year, gender, correct, options };
  } else {
    const options = shuffle([correct, randomItem(distractors), randomItem(distractors)]);
    currentQuestion = { type:'popularName', year, gender, correct, options };
  }

  document.getElementById('question').innerText = formatString(
    UI_STRINGS.questionPopularName,
    { year }
  );

  currentQuestion.options.forEach((opt,i) => {
    const btn = document.getElementById(`option${i}`);
    btn.innerText = opt.name;
    btn.style.display = 'inline-block';
  });

  document.getElementById('feedback').innerText = '';
}

// Question: Year in which a name was most popular
function generateMostPopularYearQuestion(attempts = 0) {
  if (attempts > 10) {
    console.error('Too many attempts to generate question');
    document.getElementById('question').innerText = 'Error al generar pregunta. Por favor, recarga la página.';
    return;
  }
  
  const names = [...new Set(namesData.map(d => d.name))];
  const name = randomItem(names);
  const pool = namesData.filter(d => d.name === name);
  
  if (pool.length < 3) return generateMostPopularYearQuestion(attempts + 1);
  
  const correct = pool.reduce((a,b) => a.count > b.count ? a : b);
  
  // Get other years for this name, excluding the correct one
  const otherYears = pool.filter(d => d.year !== correct.year);
  if (otherYears.length < 2) return generateMostPopularYearQuestion(attempts + 1);
  
  const options = shuffle([correct, randomItem(otherYears), randomItem(otherYears)]);
  currentQuestion = { type:'mostPopularYear', name, correct, options };

  document.getElementById('question').innerText = formatString(
    UI_STRINGS.questionMostPopularYear,
    { name }
  );

  currentQuestion.options.forEach((opt,i) => {
    const btn = document.getElementById(`option${i}`);
    btn.innerText = opt.year;
    btn.style.display = 'inline-block';
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
loadData()
  .then(() => {
    initGame();
  })
  .catch(err => {
    console.error("Failed to initialize game:", err);
    document.getElementById('question').innerText = 'Error al inicializar el juego. Por favor, recarga la página.';
  });
