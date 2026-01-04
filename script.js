const DEX_URL = "Too Many Types 2 Documentation - TMT2 Dex.csv";
const TYPE_CHART_URL = "Too Many Types 2 Documentation - Type Chart.csv";

async function loadCSV(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  return await response.text();
}

async function init() {
  const dexText = await loadCSV(DEX_URL);
  const typeChartText = await loadCSV(TYPE_CHART_URL);

  console.log("Dex CSV loaded, length:", dexText.length);
  console.log("Type Chart CSV loaded, length:", typeChartText.length);
}

init();
