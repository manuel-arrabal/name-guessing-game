// dataLoader.js
// Load CSV data into memory safely
// English comments, handles spaces, empty lines, and invalid numbers

let namesData = [];

/**
 * Load the CSV file from /data/names_2002_2023.csv
 * Parses each line and stores objects:
 * { year: number, gender: "M"|"F", name: string, count: number }
 */
async function loadData() {
  try {
    const response = await fetch('data/names_2002_2023.csv');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const csvText = await response.text();
    const lines = csvText.split('\n');

    // Remove header
    const dataLines = lines.slice(1);

    namesData = dataLines
      .map(line => line.trim())               // remove leading/trailing spaces
      .filter(line => line.length > 0)        // ignore empty lines
      .map(line => {
        // Change ',' to ';' if your CSV uses semicolon
        const [year, gender, name, count] = line.split(',').map(item => item.trim());
        return {
          year: parseInt(year, 10),
          gender,
          name,
          count: parseInt(count, 10)
        };
      })
      .filter(d => !isNaN(d.year) && !isNaN(d.count)); // remove invalid entries

    console.log(`Loaded ${namesData.length} records`);
    console.log(namesData[0]); // debug first record

  } catch (error) {
    console.error("Error loading CSV data:", error);
  }
}
