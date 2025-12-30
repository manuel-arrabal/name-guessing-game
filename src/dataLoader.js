// dataLoader.js
// English comments & code, loads CSV into namesData

let namesData = []; // Global array for game

async function loadData() {
  try {
    const response = await fetch('names_2002_2023.csv'); // CSV in same folder
    const csvText = await response.text();
    parseCSV(csvText);
    console.log(`Loaded ${namesData.length} rows`);
    return namesData;
  } catch (err) {
    console.error("Error loading CSV:", err);
  }
}

// Simple CSV parser
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  namesData = lines.slice(1).map(line => {
    const parts = line.split(',');
    return {
      year: parseInt(parts[0]),
      gender: parts[1],
      name: parts[2],
      count: parseInt(parts[3])
    };
  });
}
