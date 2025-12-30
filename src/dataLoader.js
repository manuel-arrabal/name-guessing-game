// Load CSV data into memory
let namesData = [];

// Load CSV from /data/names_2002_2023.csv
async function loadData() {
  const response = await fetch('data/names_2002_2023.csv');
  const csvText = await response.text();
  const lines = csvText.split('\n').slice(1); // skip header
  namesData = lines.map(line => {
    const [year, gender, name, count] = line.split(',');
    return {
      year: parseInt(year),
      gender,
      name,
      count: parseInt(count)
    };
  });
}
