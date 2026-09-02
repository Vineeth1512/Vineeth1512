import fs from "node:fs";

const username = process.env.GH_USERNAME;
const token = process.env.GH_TOKEN;

if (!username || !token) {
  throw new Error("GH_USERNAME and GH_TOKEN are required.");
}

const COLS = 53;
const ROWS = 7;
const MAX_TARGETS = 8;
const CELL = 14;
const GAP = 3;
const PAD_X = 28;
const PAD_Y = 48;
const GRID_W = COLS * (CELL + GAP) - GAP;
const GRID_H = ROWS * (CELL + GAP) - GAP;
const WIDTH = GRID_W + PAD_X * 2;
const HEIGHT = GRID_H + PAD_Y * 2 + 35;

const FLASH_COLOR = "#facc15";
const BULLET_COLOR = "#f97316";
const BLAST_COLOR = "#ef4444";

async function github(query, variables) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "github-jet-heatmap"
    },
    body: JSON.stringify({ query, variables })
  });

  const data = await res.json();
  if (!res.ok || data.errors) {
    throw new Error(JSON.stringify(data.errors || data));
  }
  return data.data;
}

const query = `
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}`;

const data = await github(query, { login: username });
const weeks = data.user.contributionsCollection.contributionCalendar.weeks;

// Use the most recent 53 weeks and normalize to a 53x7 grid.
const recent = weeks.slice(-COLS);
const days = recent.flatMap(w => w.contributionDays);

const levelFill = {
  NONE: "#161b22",
  FIRST_QUARTILE: "#0e4429",
  SECOND_QUARTILE: "#006d32",
  THIRD_QUARTILE: "#26a641",
  FOURTH_QUARTILE: "#39d353"
};

const cells = [];
for (let x = 0; x < COLS; x++) {
  const week = recent[x]?.contributionDays || [];
  for (let y = 0; y < ROWS; y++) {
    const day = week[y];
    if (!day) continue;
    cells.push({
      x, y,
      date: day.date,
      count: day.contributionCount,
      level: day.contributionLevel
    });
  }
}

const targets = [...cells]
  .filter(c => c.count > 0)
  .sort((a, b) => b.count - a.count)
  .slice(0, MAX_TARGETS);

const NS = "http://www.w3.org/2000/svg";

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function cellX(x) {
  return PAD_X + x * (CELL + GAP);
}

function cellY(y) {
  return PAD_Y + y * (CELL + GAP);
}

const targetAnimations = targets.map((t, i) => {
  const tx = cellX(t.x) + CELL / 2;
  const ty = cellY(t.y) + CELL / 2;
  const start = 2 + i * 1.55;
  const end = start + 0.72;
  return `
    <g>
      <circle cx="${tx}" cy="${ty}" r="3" fill="${BLAST_COLOR}" opacity="0">
        <animate attributeName="r" values="3;8;18" begin="${start}s" dur=".55s" fill="freeze"/>
        <animate attributeName="opacity" values="0;1;.0" begin="${start}s" dur=".55s" fill="freeze"/>
      </circle>
      <circle cx="${tx}" cy="${ty}" r="2" fill="${FLASH_COLOR}" opacity="0">
        <animate attributeName="r" values="2;7;2" begin="${start}s" dur=".42s" fill="freeze"/>
        <animate attributeName="opacity" values="0;1;0" begin="${start}s" dur=".42s" fill="freeze"/>
      </circle>
      <g opacity="0">
        <line x1="${tx-11}" y1="${ty}" x2="${tx+11}" y2="${ty}" stroke="${FLASH_COLOR}" stroke-width="2"/>
        <line x1="${tx}" y1="${ty-11}" x2="${tx}" y2="${ty+11}" stroke="${FLASH_COLOR}" stroke-width="2"/>
        <animate attributeName="opacity" values="0;1;0" begin="${start}s" dur=".42s" fill="freeze"/>
      </g>
    </g>`;
}).join("");

const jetStartX = -55;
const jetY = 25;
const firstTarget = targets[0];
const firstX = firstTarget ? cellX(firstTarget.x) : WIDTH / 2;
const firstY = firstTarget ? cellY(firstTarget.y) : PAD_Y;

const jetPath = `
  M ${jetStartX} ${jetY}
  L ${firstX} ${firstY}
  L ${WIDTH + 55} ${HEIGHT - 55}
  L ${jetStartX} ${jetY}
`;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="${NS}" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <title>GitHub contribution jet heatmap for ${esc(username)}</title>
  <desc>An animated jet flies across a GitHub-style contribution grid and targets busy contribution days.</desc>
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="jetGradient" x1="0" x2="1">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#e5e7eb"/>
    </linearGradient>
  </defs>

  <rect width="100%" height="100%" rx="18" fill="#0d1117"/>

  <text x="${PAD_X}" y="27" fill="#f0f6fc" font-family="Arial, sans-serif"
        font-size="16" font-weight="700">GitHub Jet Heatmap · ${esc(username)}</text>

  <g>
    ${cells.map(c => `
      <rect x="${cellX(c.x)}" y="${cellY(c.y)}" width="${CELL}" height="${CELL}"
        rx="2" fill="${levelFill[c.level] || levelFill.NONE}">
        <title>${esc(c.date)} · ${c.count} contributions</title>
      </rect>`).join("")}
  </g>

  <g filter="url(#glow)" id="jet">
    <g transform="translate(${jetStartX} ${jetY})">
      <path d="M0 0 L28 -7 L42 0 L28 7 Z" fill="url(#jetGradient)"/>
      <path d="M14 -1 L4 -13 L22 -5 Z" fill="#93c5fd"/>
      <path d="M14 1 L4 13 L22 5 Z" fill="#93c5fd"/>
      <circle cx="4" cy="0" r="2" fill="#f8fafc"/>
      <animateMotion dur="12s" repeatCount="indefinite" rotate="auto" path="${jetPath}"/>
    </g>
  </g>

  <g id="effects">
    ${targetAnimations}
  </g>

  <text x="${PAD_X}" y="${HEIGHT - 15}" fill="#8b949e" font-family="Arial, sans-serif" font-size="11">
    Busiest contribution days are highlighted with impact effects.
  </text>
</svg>`;

fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync("dist/github-jet.svg", svg);
console.log(`Generated dist/github-jet.svg for ${username}`);
