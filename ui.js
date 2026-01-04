function buildDatalist() {
  const list = document.getElementById("pokemon-list");
  Object.keys(POKEMON_TYPES)
    .sort()
    .forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      list.appendChild(opt);
    });
}

function getMultiplier(attacking, defendingTypes) {
  let mult = 1;
  for (const def of defendingTypes) {
    const m = TYPE_CHART[attacking]?.[def];
    if (m !== undefined) mult *= m;
  }
  return mult;
}

function multClass(m) {
  if (m === 0) return "mult-0";
  if (m === 0.25) return "mult-025";
  if (m === 0.5) return "mult-05";
  if (m === 1) return "mult-1";
  if (m === 2) return "mult-2";
  if (m >= 4) return "mult-4";
  return "";
}

function analyzeTeam() {
  const inputs = Array.from(document.querySelectorAll("#team-inputs input"));
  const team = inputs
    .map(i => i.value.trim().toUpperCase())
    .filter(n => POKEMON_TYPES[n]);

  const attackers = Object.keys(TYPE_CHART).sort();

  const grid = document.createElement("table");
  const header = document.createElement("tr");
  header.innerHTML = `<th>Attack</th>` + team.map(p => `<th>${p}</th>`).join("");
  grid.appendChild(header);

  const summary = document.createElement("table");
  summary.innerHTML = `<tr><th>Attack</th><th>Weak</th><th>Resist</th><th>Immune</th></tr>`;

  attackers.forEach(atk => {
    let weak = 0, resist = 0, immune = 0;
    const row = document.createElement("tr");
    row.innerHTML = `<th>${atk}</th>`;

    team.forEach(p => {
      const m = getMultiplier(atk, POKEMON_TYPES[p]);
      if (m === 0) immune++;
      else if (m > 1) weak++;
      else if (m < 1) resist++;

      row.innerHTML += `<td class="${multClass(m)}">${m}</td>`;
    });

    grid.appendChild(row);

    const srow = document.createElement("tr");
    srow.innerHTML = `<th>${atk}</th><td>${weak}</td><td>${resist}</td><td>${immune}</td>`;
    summary.appendChild(srow);
  });

  document.getElementById("grid-container").replaceChildren(grid);
  document.getElementById("summary-container").replaceChildren(summary);
}

document.getElementById("analyze").addEventListener("click", analyzeTeam);

buildDatalist();
