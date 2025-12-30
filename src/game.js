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
  const shuffled = [...arr]; // Create a copy
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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
    if (btn && opt && opt.name) {
      btn.innerText = opt.name;
      btn.style.display = 'inline-block';
    } else {
      console.error(`Invalid option at index ${i}:`, opt);
      btn.style.display = 'none';
    }
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
  
  const names = [...new Set(namesData.map(d => d.name).filter(n => n && n.trim() !== ''))];
  if (names.length === 0) {
    console.error('No valid names found in data');
    return;
  }
  const name = randomItem(names);
  if (!name || name.trim() === '') {
    return generateMostPopularYearQuestion(attempts + 1);
  }
  const pool = namesData.filter(d => d.name === name && d.year && !isNaN(d.year));
  
  if (pool.length < 3) return generateMostPopularYearQuestion(attempts + 1);
  
  const correct = pool.reduce((a,b) => a.count > b.count ? a : b);
  
  // Validate correct answer
  if (!correct || !correct.year || isNaN(correct.year)) {
    console.error('Invalid correct answer:', correct);
    return generateMostPopularYearQuestion(attempts + 1);
  }
  
  // Get other years for this name, excluding the correct one
  const otherYears = pool.filter(d => d.year !== correct.year && d.year && !isNaN(d.year));
  if (otherYears.length < 2) return generateMostPopularYearQuestion(attempts + 1);
  
  // Ensure we have unique years for options
  const uniqueYears = [...new Set(otherYears.map(d => d.year).filter(y => !isNaN(y) && y > 0))];
  if (uniqueYears.length < 2) {
    console.log('Not enough unique years:', uniqueYears);
    return generateMostPopularYearQuestion(attempts + 1);
  }
  
  // Get first occurrence of each unique year
  const year1 = otherYears.find(d => d.year === uniqueYears[0] && d.year && !isNaN(d.year));
  const year2 = otherYears.find(d => d.year === uniqueYears[1] && d.year && !isNaN(d.year));
  
  console.log('Selected years:', { 
    uniqueYears, 
    year1: year1 ? { year: year1.year, full: year1 } : null,
    year2: year2 ? { year: year2.year, full: year2 } : null,
    correct: { year: correct.year, full: correct }
  });
  
  if (!year1 || !year1.year || isNaN(year1.year) || !year2 || !year2.year || isNaN(year2.year)) {
    console.error('Invalid year options:', { year1, year2, uniqueYears });
    return generateMostPopularYearQuestion(attempts + 1);
  }
  
  // Validate all three options before shuffling
  if (!correct || !correct.year || isNaN(correct.year)) {
    console.error('Invalid correct option:', correct);
    return generateMostPopularYearQuestion(attempts + 1);
  }
  
  const options = shuffle([correct, year1, year2]);
  
  // Final validation of options
  options.forEach((opt, idx) => {
    if (!opt || !opt.year || isNaN(opt.year)) {
      console.error(`Invalid option after shuffle at index ${idx}:`, opt);
    }
  });
  currentQuestion = { type:'mostPopularYear', name, correct, options };

  if (!name || name.trim() === '') {
    console.error('Name is empty or undefined');
    return generateMostPopularYearQuestion(attempts + 1);
  }
  
  console.log('Generated question:', { 
    name, 
    nameType: typeof name,
    correct: correct.year, 
    correctObj: correct,
    options: options.map(o => ({ year: o.year, fullObj: o }))
  });

  // Validate name before using it
  if (!name || String(name).trim() === '' || name === '0') {
    console.error('Invalid name value:', name);
    return generateMostPopularYearQuestion(attempts + 1);
  }

  const questionText = formatString(
    UI_STRINGS.questionMostPopularYear,
    { name: String(name) }
  );
  document.getElementById('question').innerText = questionText;

  currentQuestion.options.forEach((opt,i) => {
    const btn = document.getElementById(`option${i}`);
    if (!btn) {
      console.error(`Button option${i} not found`);
      return;
    }
    
    if (!opt) {
      console.error(`Option ${i} is null or undefined`);
      btn.style.display = 'none';
      return;
    }
    
    const yearValue = opt.year;
    console.log(`Option ${i}:`, { opt, yearValue, yearType: typeof yearValue });
    
    if (typeof yearValue !== 'undefined' && yearValue !== null && !isNaN(yearValue)) {
      btn.innerText = String(yearValue);
      btn.style.display = 'inline-block';
    } else {
      console.error(`Invalid year in option ${i}:`, { opt, yearValue });
      btn.style.display = 'none';
    }
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
