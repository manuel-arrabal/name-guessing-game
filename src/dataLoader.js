// dataLoader.js
// Load CSV into namesData array
// English comments; Spanish front-end

let namesData = [];

function loadData() {
  return fetch('data/names_2002_2023.csv')
    .then(response => response.text())
    .then(csvText => {
      namesData = [];
      const lines = csvText.trim().split('\n');
      lines.shift(); // remove header

      lines.forEach(line => {
        const cols = line.split(',');
        if (cols.length < 4) return;

        const year = parseInt(cols[0].trim());
        const gender = cols[1].trim();
        const name = cols[2].trim();
        const count = parseInt(cols[3].trim());

        if (isNaN(year) || isNaN(count) || !name || !gender) return;

        namesData.push({ year, gender, name, count });
      });

      console.log('Loaded records:', namesData.length);
      console.log('First record:', namesData[0]);
      return namesData;
    })
    .catch(err => console.error('Error loading CSV:', err));
}
