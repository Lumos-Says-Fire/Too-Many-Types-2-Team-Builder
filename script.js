const DEX_URL = "Too Many Types 2 Documentation - TMT2 Dex.csv";
const TYPE_CHART_URL = "Too Many Types 2 Documentation - Type Chart.csv";

/* =========================
   HELPERS
   ========================= */

function norm(value) {
  if (value === null || value === undefined) return null;
  return String(value)
    .replace(/\r/g, "")
    .replace(/\n/g, "")
    .trim()
    .toUpperCase();
}

function parseCSV(text) {
  return text
    .split("\n")
    .map(line => line.split(","));
}

async function loadCSV(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return await res.text();
}

/* =========================
   INIT
   ========================= */

async function init() {
  const dexText = await loadCSV(DEX_URL);
  const chartText = await loadCSV(TYPE_CHART_URL);

  const dexRows = parseCSV(dexText);
  const chartRows = parseCSV(chartText);

  /* =========================
     POKEMON TYPES
     ========================= */

  const dexHeader = dexRows[0];
  const nameCol = dexHeader.indexOf("Name");

  const typeCols = [];
  dexHeader.forEach((h, i) => {
    if (h && h.startsWith("Type")) {
      typeCols.push(i);
    }
  });

  const POKEMON_TYPES = {};

  for (let i = 1; i < dexRows.length; i++) {
    const row = dexRows[i];
    const name = norm(row[nameCol]);
    if (!name) continue;

    const types = [];
    for (const col of typeCols) {
      const t = norm(row[col]);
      if (t) types.push(t);
    }

    if (types.length) {
      POKEMON_TYPES[name] = types;
    }
  }

  console.log("Loaded Pokémon:", Object.keys(POKEMON_TYPES).length);
  console.log("Sample Pokémon:", Object.entries(POKEMON_TYPES).slice(0, 3));

  /* =========================
     TYPE CHART
     ========================= */

  // ---- DEFENDERS ----
  // Row 2 (index 1), starting at column C (index 2)
  const defendingTypes = [];
  let col = 2;

  while (col < chartRows[1].length) {
    const raw = chartRows[1][col];
    const name = norm(raw);
    if (!name) break; // defender list ends here
    defendingTypes.push(name);
    col++;
  }

  // ---- ATTACKERS ----
  // Column B (index 1), rows 3–82 (indexes 2–81 inclusive)
  const attackingTypes = [];
  for (let row = 2; row <= 81 && row < chartRows.length; row++) {
    const name = norm(chartRows[row][1]);
    if (name) attackingTypes.push(name);
  }

  const TYPE_CHART = {};

  for (let a = 0; a < attackingTypes.length; a++) {
    const atk = attackingTypes[a];
    TYPE_CHART[atk] = {};

    for (let d = 0; d < defendingTypes.length; d++) {
      const cell = chartRows[a + 2]?.[d + 2];
      const val = parseFloat(cell);

      if (!Number.isFinite(val)) continue;
      if (val !== 1) {
        TYPE_CHART[atk][defendingTypes[d]] = val;
      }
    }
  }

  console.log("Loaded attacking types:", attackingTypes.length);
  console.log("Loaded defending types:", defendingTypes.length);
  console.log("FIRE sample:", TYPE_CHART["FIRE"]);

  // Expose for UI
  window.POKEMON_TYPES = POKEMON_TYPES;
  window.TYPE_CHART = TYPE_CHART;
}

init();
