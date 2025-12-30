// game.js
// English comments; Spanish front-end
// Requires dataLoader.js loaded first

let currentQuestion = null;
let score = 0;
let totalQuestions = 0;

// Helper functions
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate question
function generateQuestion() {
  if (Math.random() < 0.5) {
    generatePopularNameQuestion();
  } else {
    generateMostPopularYearQuestion();
  }
}

// Question: Most popular name in a year
function generatePopularNameQuestion() {
  const years = [...new Set(namesData.map(d => d.year))];
  const year = randomItem(years);
  const gender = randomItem(['M','F']);
  const pool = namesData.filter(d => d.year === year && d.gender === gender);

  if (pool.length < 3) return generateQuestion();

  const correct = randomItem(pool);
  const distractors = pool.filter(d => d.name !== correct.name && Math.abs(d.count - correct.count) < 2000);

  const options = shuffle([
    correct,
    randomItem(distractors),
    randomItem(distractors)
  ]);

  currentQuestion = { type:'popularName', year, gender, correct, options };

  document.getElementById('question').innerText = `¿Cuál fue el nombre más popular en ${year}? (${gender==='M'?'Hombre':'Mujer'})`;

  options.forEach((opt,i) => {
    document.getElementById(`option${i}`).innerText = opt.name;
  });
}

// Question: Most popular year for a name
function generateMostPopularYearQuestion() {
  const namesWithMultipleYears = Array.from(new Set(namesData.map(d=>d.name).filter(name => namesData.filter(e=>e.name===name).length>1)));

  let name = null;
  let pool = [];

  do {
    name = randomItem(namesWithMultipleYears);
    pool = namesData.filter(d=>d.name===name);
  } while(pool.length<2);

  const correct = pool.reduce((a,b)=> a.count>b.count?a:b);
  const distractors = pool.filter(d=>d.year!==correct.year);

  const options = shuffle([correct, randomItem(distractors), randomItem(distractors)]);

  currentQuestion = { type:'nameYear', name, correct, options };

  document.getElementById('question').innerText = `¿En qué año fue más popular el nombre ${name}?`;

  options.forEach((opt,i)=> {
    document.getElementById(`option${i}`).innerText = opt.year;
  });
}

// Check answer
function checkAnswer(index) {
  const selected = currentQuestion.options[index];
  let isCorrect = false;

  if(currentQuestion.type==='popularName') isCorrect = selected.name===currentQuestion.correct.name;
  if(currentQuestion.type==='nameYear') isCorrect = selected.year===currentQuestion.correct.year;

  totalQuestions++;
  if(isCorrect) score++;

  document.getElementById('feedback').innerText = isCorrect
    ? '✅ Correcto!'
    : `❌ Incorrecto. La respuesta correcta era ${currentQuestion.type==='popularName'?currentQuestion.correct.name:currentQuestion.correct.year} (${currentQuestion.correct.count} nacimientos)`;

  document.getElementById('score').innerText = `Puntuación: ${score} / ${totalQuestions}`;

  setTimeout(generateQuestion,1500);
}

// Init game
function initGame() {
  for(let i=0;i<3;i++){
    document.getElementById(`option${i}`).addEventListener('click',()=>checkAnswer(i));
  }
  generateQuestion();
}

// Wait for data
loadData().then(() => {
  console.log('Datos cargados, iniciando juego...');
  initGame();
});
