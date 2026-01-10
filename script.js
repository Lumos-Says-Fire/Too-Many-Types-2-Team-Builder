const DEX_URL = "Too Many Types 2 Documentation - TMT2 Dex.csv";
const TYPE_CHART_URL = "Too Many Types 2 Documentation - Type Chart.csv";
const ABILITIES_URL = "Too Many Types 2 Documentation - Abilities.csv";

/* =========================
   HELPERS
   ========================= */

function norm(v) {
  if (v === null || v === undefined) return null;
  return String(v)
    .replace(/\r/g, "")
    .replace(/\n/g, "")
    .trim()
    .toUpperCase();
}

async function loadCSV(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  const text = await res.text();

  return Papa.parse(text, {
    skipEmptyLines: true
  }).data;
}

/* =========================
   INIT
   ========================= */

async function init() {
  const dexRows = await loadCSV(DEX_URL);
  const chartRows = await loadCSV(TYPE_CHART_URL);
  const abilityRows = await loadCSV(ABILITIES_URL);

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
  // Row 2 (index 1), columns C → CD (indexes 2 → 81)
  const defendingTypes = [];
  for (let c = 2; c <= 81; c++) {
    const name = norm(chartRows[1][c]);
    if (name) defendingTypes.push(name);
  }

  // ---- ATTACKERS ----
  // Column B (index 1), rows 3 → 82 (indexes 2 → 81)
  const attackingTypes = [];
  for (let r = 2; r <= 81 && r < chartRows.length; r++) {
    const name = norm(chartRows[r][1]);
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

  /* =========================
     ABILITIES
     ========================= */

  const POKEMON_ABILITIES = {};

  for (let i = 0; i < abilityRows.length; i++) {
    const row = abilityRows[i];
    const pokemonName = norm(row[0]);
    const abilityName = row[1]?.trim();
    const immuneType = norm(row[2]);
    const extraInstruction = row[3]?.trim();

    if (!pokemonName || !abilityName) continue;

    POKEMON_ABILITIES[pokemonName] = {
      name: abilityName,
      immuneType: immuneType || null,
      instruction: extraInstruction || null
    };
  }

  console.log("Loaded abilities:", Object.keys(POKEMON_ABILITIES).length);

  window.POKEMON_TYPES = POKEMON_TYPES;
  window.TYPE_CHART = TYPE_CHART;
  window.POKEMON_ABILITIES = POKEMON_ABILITIES;
}

/* =========================
   LOAD PAPAPARSE + START
   ========================= */

const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js";
script.onload = init;
document.head.appendChild(script);
