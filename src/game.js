// game.js
// Main game logic

let currentQuestion = null;
let score = 0;
let totalQuestions = 0;

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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

function generateQuestion() {
  const type = Math.random() < 0.5 ? 'popularName' : 'mostPopularYear';
  if (type === 'popularName') {
    generatePopularNameQuestion();
  } else {
    generateMostPopularYearQuestion();
  }
}

function generatePopularNameQuestion(attempts = 0) {
  if (attempts > 10) {
    console.error('Too many attempts to generate popularName question');
    return generateMostPopularYearQuestion();
  }
  
  const years = [...new Set(namesData.map(d => d.year))];
  const year = randomItem(years);
  const gender = randomItem(['M', 'F']);
  const pool = namesData.filter(d => d.year === year && d.gender === gender);
  
  if (pool.length < 3) {
    return generatePopularNameQuestion(attempts + 1);
  }

  const sortedPool = [...pool].sort((a, b) => b.count - a.count);
  const correct = sortedPool[0];
  
  // Get distractors with similar popularity
  const distractors = sortedPool.slice(1).filter(d => 
    d.name !== correct.name && 
    Math.abs(d.count - correct.count) < correct.count * 0.5
  );
  
  let options;
  if (distractors.length >= 2) {
    // Pick 2 different distractors
    const d1 = randomItem(distractors);
    const remaining = distractors.filter(d => d.name !== d1.name);
    const d2 = remaining.length > 0 ? randomItem(remaining) : sortedPool[1];
    options = shuffle([correct, d1, d2]);
  } else {
    // Use top names if not enough similar distractors
    const otherNames = sortedPool.slice(1, 3);
    if (otherNames.length < 2) {
      return generatePopularNameQuestion(attempts + 1);
    }
    options = shuffle([correct, otherNames[0], otherNames[1]]);
  }
  
  currentQuestion = { type: 'popularName', year, gender, correct, options };

  const genderText = gender === 'M' ? UI_STRINGS.genderMale : UI_STRINGS.genderFemale;
  document.getElementById('question').innerText = formatString(
    UI_STRINGS.questionPopularName,
    { year, gender: genderText }
  );

  currentQuestion.options.forEach((opt, i) => {
    const btn = document.getElementById(`option${i}`);
    if (btn && opt && opt.name) {
      btn.innerText = opt.name;
      btn.style.display = 'inline-block';
      btn.disabled = false;
    } else {
      console.error(`Invalid option at index ${i}:`, opt);
      btn.style.display = 'none';
    }
  });

  document.getElementById('feedback').innerText = '';
}

function generateMostPopularYearQuestion(attempts = 0) {
  if (attempts > 20) {
    console.error('Too many attempts to generate mostPopularYear question');
    return generatePopularNameQuestion();
  }
  
  try {
    const names = [...new Set(namesData.map(d => d.name).filter(n => n && n.trim() !== ''))];
    if (names.length === 0) {
      console.error('No valid names found in data');
      return generatePopularNameQuestion();
    }
    
    const name = randomItem(names);
    if (!name || String(name).trim() === '') {
      return generateMostPopularYearQuestion(attempts + 1);
    }
    
    const pool = namesData.filter(d => d.name === name && d.year && !isNaN(parseInt(d.year)));
    if (pool.length < 3) {
      return generateMostPopularYearQuestion(attempts + 1);
    }
    
    const correct = pool.reduce((a, b) => (a.count > b.count ? a : b));
    if (!correct || !correct.year) {
      return generateMostPopularYearQuestion(attempts + 1);
    }
    
    // Get unique years different from correct answer
    const uniqueYears = [...new Set(pool.map(d => d.year))].filter(y => y !== correct.year);
    if (uniqueYears.length < 2) {
      return generateMostPopularYearQuestion(attempts + 1);
    }
    
    const year1 = uniqueYears[0];
    const year2 = uniqueYears[1];
    const entry1 = pool.find(d => d.year === year1);
    const entry2 = pool.find(d => d.year === year2);
    
    if (!entry1 || !entry2) {
      return generateMostPopularYearQuestion(attempts + 1);
    }
    
    const options = shuffle([correct, entry1, entry2]);
    currentQuestion = { type: 'mostPopularYear', name: String(name), correct, options };

    document.getElementById('question').innerText = formatString(
      UI_STRINGS.questionMostPopularYear,
      { name: String(name) }
    );

    currentQuestion.options.forEach((opt, i) => {
      const btn = document.getElementById(`option${i}`);
      if (!btn) {
        console.error(`Button option${i} not found in DOM`);
        return;
      }
      
      if (!opt || opt.year === undefined || opt.year === null) {
        console.error(`Invalid option ${i}:`, opt);
        btn.style.display = 'none';
        return;
      }
      
      const yearValue = parseInt(opt.year);
      if (!isNaN(yearValue) && yearValue > 0) {
        btn.innerText = String(yearValue);
        btn.style.display = 'inline-block';
        btn.disabled = false;
      } else {
        console.error(`Invalid year value for option ${i}:`, opt);
        btn.style.display = 'none';
      }
    });

    document.getElementById('feedback').innerText = '';
  } catch (error) {
    console.error('Error generating question:', error);
    return generatePopularNameQuestion();
  }
}

function checkAnswer(index) {
  const selected = currentQuestion.options[index];
  let isCorrect = false;

  if (currentQuestion.type === 'popularName') {
    isCorrect = selected.name === currentQuestion.correct.name;
  } else {
    isCorrect = selected.year === currentQuestion.correct.year;
  }

  totalQuestions++;
  if (isCorrect) score++;

  // Disable all buttons
  for (let i = 0; i < 3; i++) {
    document.getElementById(`option${i}`).disabled = true;
  }

  const feedbackEl = document.getElementById('feedback');
  if (isCorrect) {
    feedbackEl.innerHTML = `<span class="correct">${UI_STRINGS.correct}</span>`;
  } else {
    const answer = currentQuestion.type === 'popularName' 
      ? currentQuestion.correct.name 
      : currentQuestion.correct.year;
    const msg = formatString(UI_STRINGS.incorrect, {
      answer,
      count: currentQuestion.correct.count
    });
    feedbackEl.innerHTML = `<span class="incorrect">${msg}</span>`;
  }

  document.getElementById('score').innerText = formatString(UI_STRINGS.score, {
    score,
    total: totalQuestions
  });

  setTimeout(generateQuestion, 2000);
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
