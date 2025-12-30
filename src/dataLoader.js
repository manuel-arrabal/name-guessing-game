// dataLoader.js
// English comments & code, loads CSV into namesData

let namesData = []; // Global array for game

async function loadData() {
  try {
    // Use relative path that works both locally and on GitHub Pages
    const csvPath = 'data/names_2001_2023.csv';
    console.log('Loading CSV from:', csvPath);
    const response = await fetch(csvPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, URL: ${csvPath}`);
    }
    const csvText = await response.text();
    if (!csvText || csvText.trim().length === 0) {
      throw new Error('CSV file is empty');
    }
    parseCSV(csvText);
    if (namesData.length === 0) {
      throw new Error('No data parsed from CSV');
    }
    console.log(`Loaded ${namesData.length} rows`);
    return namesData;
  } catch (err) {
    console.error("Error loading CSV:", err);
    const questionEl = document.getElementById('question');
    if (questionEl) {
      questionEl.innerText = `Error al cargar los datos: ${err.message}. Por favor, recarga la página.`;
    }
    throw err;
  }
}

// Simple CSV parser
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  namesData = lines.slice(1)
    .filter(line => line.trim().length > 0) // Skip empty lines
    .map(line => {
      const parts = line.split(',');
      if (parts.length !== 4) {
        console.warn('Invalid CSV line:', line);
        return null;
      }
      return {
        year: parseInt(parts[0]),
        gender: parts[1].trim(),
        name: parts[2].trim(),
        count: parseInt(parts[3])
      };
    })
    .filter(item => item !== null && !isNaN(item.year) && !isNaN(item.count));
  
  console.log(`Parsed ${namesData.length} valid rows from CSV`);
}
