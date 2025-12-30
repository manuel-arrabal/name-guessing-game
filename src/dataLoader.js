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
    .map((line, lineNum) => {
      // Remove any BOM or special characters
      line = line.replace(/^\uFEFF/, '');
      
      const parts = line.split(',');
      if (parts.length !== 4) {
        console.warn(`Invalid CSV line ${lineNum + 2} (expected 4 parts, got ${parts.length}):`, line);
        return null;
      }
      
      const yearStr = parts[0].trim();
      const gender = parts[1].trim();
      const name = parts[2].trim();
      const countStr = parts[3].trim();
      
      const year = parseInt(yearStr, 10);
      const count = parseInt(countStr, 10);
      
      // Validate all fields
      if (isNaN(year) || isNaN(count) || !gender || !name || name.length === 0) {
        console.warn(`Invalid data in line ${lineNum + 2}:`, { yearStr, gender, name, countStr, year, count });
        return null;
      }
      
      // Ensure name is a string, not a number
      const nameStr = String(name);
      if (nameStr === '0' || nameStr === '') {
        console.warn(`Invalid name in line ${lineNum + 2}:`, name);
        return null;
      }
      
      return {
        year: year,
        gender: gender,
        name: nameStr,
        count: count
      };
    })
    .filter(item => item !== null && 
                   !isNaN(item.year) && 
                   !isNaN(item.count) && 
                   item.name && 
                   item.name.trim().length > 0 &&
                   item.name !== '0' &&
                   item.gender &&
                   item.year > 0 &&
                   item.count > 0);
  
  console.log(`Parsed ${namesData.length} valid rows from CSV`);
  if (namesData.length > 0) {
    console.log('Sample data:', namesData[0]);
    console.log('Sample name type:', typeof namesData[0].name);
  }
}
