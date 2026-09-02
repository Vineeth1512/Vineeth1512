import fs from "node:fs";

const username = process.env.GH_USERNAME;
const token = process.env.GH_TOKEN;

if (!username || !token) {
  throw new Error("GH_USERNAME and GH_TOKEN are required");
}

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "Vineeth1512-terminal-profile"
};

async function github(url) {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/* --------------------------------
   GET GITHUB PROFILE
-------------------------------- */

const profile = await github(
  `https://api.github.com/users/${username}`
);

/* --------------------------------
   GET REPOSITORIES
-------------------------------- */

const repos = await github(
  `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
);

/* --------------------------------
   CALCULATE STARS
-------------------------------- */

const totalStars = repos.reduce(
  (total, repo) => total + repo.stargazers_count,
  0
);

/* --------------------------------
   CALCULATE FORKS
-------------------------------- */

const totalForks = repos.reduce(
  (total, repo) => total + repo.forks_count,
  0
);

/* --------------------------------
   TOP LANGUAGES
-------------------------------- */

const languageCount = {};

for (const repo of repos) {
  if (!repo.language) continue;

  languageCount[repo.language] =
    (languageCount[repo.language] || 0) + 1;
}

const topLanguages = Object.entries(languageCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([language]) => language)
  .join(" • ");

/* --------------------------------
   PROFILE DATA
-------------------------------- */

const name = profile.name || username;

const bio =
  profile.bio ||
  "Full Stack Developer building scalable web applications.";

const location =
  profile.location ||
  "India";

const publicRepos =
  profile.public_repos ?? 0;

const followers =
  profile.followers ?? 0;

const following =
  profile.following ?? 0;

const avatar =
  profile.avatar_url || "";

/* --------------------------------
   SVG CONFIGURATION
-------------------------------- */

const WIDTH = 1200;
const HEIGHT = 650;

const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${WIDTH}"
  height="${HEIGHT}"
  viewBox="0 0 ${WIDTH} ${HEIGHT}"
>

  <defs>

    <filter id="glow">
      <feGaussianBlur
        stdDeviation="3"
        result="blur"
      />

      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <linearGradient
      id="border"
      x1="0"
      y1="0"
      x2="1"
      y2="1"
    >
      <stop offset="0%" stop-color="#00ffff"/>
      <stop offset="50%" stop-color="#00ff9c"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>

  </defs>


  <!-- BACKGROUND -->

  <rect
    width="100%"
    height="100%"
    rx="22"
    fill="#050912"
  />

  <rect
    x="3"
    y="3"
    width="${WIDTH - 6}"
    height="${HEIGHT - 6}"
    rx="20"
    fill="none"
    stroke="url(#border)"
    stroke-width="2"
  />


  <!-- TERMINAL HEADER -->

  <circle
    cx="32"
    cy="30"
    r="8"
    fill="#ff5f56"
  />

  <circle
    cx="56"
    cy="30"
    r="8"
    fill="#ffbd2e"
  />

  <circle
    cx="80"
    cy="30"
    r="8"
    fill="#27c93f"
  />

  <text
    x="430"
    y="37"
    text-anchor="middle"
    fill="#00ff9c"
    font-family="monospace"
    font-size="18"
    font-weight="bold"
  >
    terminal@${escapeXml(username)}:~$ ./profile --live
  </text>

  <text
    x="1135"
    y="37"
    text-anchor="end"
    fill="#ff4fd8"
    font-family="monospace"
    font-size="15"
    font-weight="bold"
  >
    [ ONLINE ]
  </text>


  <!-- LEFT PANEL -->

  <rect
    x="25"
    y="65"
    width="420"
    height="450"
    rx="14"
    fill="#07101c"
    stroke="#00c9d9"
    stroke-width="1"
  />

  <text
    x="45"
    y="95"
    fill="#00ff9c"
    font-family="monospace"
    font-size="17"
    font-weight="bold"
  >
    &gt; DEVELOPER.PROFILE
  </text>


  <!-- AVATAR -->

  <rect
    x="55"
    y="120"
    width="360"
    height="250"
    rx="10"
    fill="#02060c"
    stroke="#164e63"
  />

  <image
    href="${escapeXml(avatar)}"
    x="135"
    y="130"
    width="200"
    height="200"
    preserveAspectRatio="xMidYMid slice"
  />

  <text
    x="235"
    y="350"
    text-anchor="middle"
    fill="#00ffff"
    font-family="monospace"
    font-size="15"
  >
    &gt; ${escapeXml(username)}_
  </text>


  <!-- LEFT BOTTOM -->

  <line
    x1="45"
    y1="395"
    x2="425"
    y2="395"
    stroke="#164e63"
  />

  <text
    x="45"
    y="425"
    fill="#7dd3fc"
    font-family="monospace"
    font-size="14"
  >
    &gt; STATUS
  </text>

  <text
    x="45"
    y="450"
    fill="#00ff9c"
    font-family="monospace"
    font-size="14"
  >
    ● BUILDING • LEARNING • GROWING
  </text>

  <text
    x="45"
    y="480"
    fill="#94a3b8"
    font-family="monospace"
    font-size="13"
  >
    ${escapeXml(bio).slice(0, 48)}
  </text>


  <!-- RIGHT PANEL -->

  <rect
    x="465"
    y="65"
    width="710"
    height="450"
    rx="14"
    fill="#07101c"
    stroke="#00c9d9"
    stroke-width="1"
  />

  <text
    x="490"
    y="95"
    fill="#00ff9c"
    font-family="monospace"
    font-size="17"
    font-weight="bold"
  >
    &gt; PROFILE.INFO
  </text>


  <!-- NAME -->

  <text
    x="490"
    y="130"
    fill="#39ff88"
    font-family="monospace"
    font-size="28"
    font-weight="bold"
  >
    ${escapeXml(name)}
  </text>

  <text
    x="490"
    y="158"
    fill="#dbeafe"
    font-family="monospace"
    font-size="17"
  >
    Full Stack Developer
    <tspan fill="#00ff9c"> █</tspan>
  </text>


  <line
    x1="490"
    y1="175"
    x2="1145"
    y2="175"
    stroke="#155e75"
  />


  <!-- PROFILE INFORMATION -->

  <text
    x="490"
    y="205"
    fill="#22d3ee"
    font-family="monospace"
    font-size="14"
  >
    Username
  </text>

  <text
    x="650"
    y="205"
    fill="#e5e7eb"
    font-family="monospace"
    font-size="14"
  >
    : ${escapeXml(username)}
  </text>


  <text
    x="490"
    y="230"
    fill="#22d3ee"
    font-family="monospace"
    font-size="14"
  >
    Location
  </text>

  <text
    x="650"
    y="230"
    fill="#e5e7eb"
    font-family="monospace"
    font-size="14"
  >
    : ${escapeXml(location)}
  </text>


  <text
    x="490"
    y="255"
    fill="#22d3ee"
    font-family="monospace"
    font-size="14"
  >
    Repositories
  </text>

  <text
    x="650"
    y="255"
    fill="#e5e7eb"
    font-family="monospace"
    font-size="14"
  >
    : ${publicRepos}
  </text>


  <text
    x="490"
    y="280"
    fill="#22d3ee"
    font-family="monospace"
    font-size="14"
  >
    Followers
  </text>

  <text
    x="650"
    y="280"
    fill="#e5e7eb"
    font-family="monospace"
    font-size="14"
  >
    : ${followers}
  </text>


  <text
    x="490"
    y="305"
    fill="#22d3ee"
    font-family="monospace"
    font-size="14"
  >
    Following
  </text>

  <text
    x="650"
    y="305"
    fill="#e5e7eb"
    font-family="monospace"
    font-size="14"
  >
    : ${following}
  </text>


  <!-- TECH STACK -->

  <line
    x1="490"
    y1="330"
    x2="1145"
    y2="330"
    stroke="#155e75"
  />

  <text
    x="490"
    y="355"
    fill="#00ff9c"
    font-family="monospace"
    font-size="16"
    font-weight="bold"
  >
    &gt; TECH.STACK
  </text>


  <text
    x="490"
    y="385"
    fill="#c084fc"
    font-family="monospace"
    font-size="14"
  >
    Frontend
  </text>

  <text
    x="650"
    y="385"
    fill="#e5e7eb"
    font-family="monospace"
    font-size="14"
  >
    : React • JavaScript • HTML • CSS
  </text>


  <text
    x="490"
    y="410"
    fill="#c084fc"
    font-family="monospace"
    font-size="14"
  >
    Backend
  </text>

  <text
    x="650"
    y="410"
    fill="#e5e7eb"
    font-family="monospace"
    font-size="14"
  >
    : Java • Spring Boot • Node.js
  </text>


  <text
    x="490"
    y="435"
    fill="#c084fc"
    font-family="monospace"
    font-size="14"
  >
    Database
  </text>

  <text
    x="650"
    y="435"
    fill="#e5e7eb"
    font-family="monospace"
    font-size="14"
  >
    : MongoDB • MySQL • Firebase
  </text>


  <text
    x="490"
    y="460"
    fill="#c084fc"
    font-family="monospace"
    font-size="14"
  >
    Languages
  </text>

  <text
    x="650"
    y="460"
    fill="#e5e7eb"
    font-family="monospace"
    font-size="14"
  >
    : ${escapeXml(topLanguages || "JavaScript • Java")}
  </text>


  <text
    x="490"
    y="490"
    fill="#00ff9c"
    font-family="monospace"
    font-size="13"
  >
    $ ${escapeXml(bio).slice(0, 75)}
  </text>


  <!-- LIVE STATS -->

  <rect
    x="25"
    y="535"
    width="1150"
    height="90"
    rx="14"
    fill="#07101c"
    stroke="#00ff9c"
    stroke-width="1"
  />

  <text
    x="45"
    y="562"
    fill="#00ff9c"
    font-family="monospace"
    font-size="15"
    font-weight="bold"
  >
    &gt; LIVE.STATS
  </text>


  <text
    x="85"
    y="595"
    fill="#a855f7"
    font-family="monospace"
    font-size="13"
  >
    REPOSITORIES
  </text>

  <text
    x="85"
    y="615"
    fill="#ffffff"
    font-family="monospace"
    font-size="18"
    font-weight="bold"
  >
    ${publicRepos}
  </text>


  <text
    x="320"
    y="595"
    fill="#22d3ee"
    font-family="monospace"
    font-size="13"
  >
    FOLLOWERS
  </text>

  <text
    x="320"
    y="615"
    fill="#ffffff"
    font-family="monospace"
    font-size="18"
    font-weight="bold"
  >
    ${followers}
  </text>


  <text
    x="555"
    y="595"
    fill="#facc15"
    font-family="monospace"
    font-size="13"
  >
    STARS
  </text>

  <text
    x="555"
    y="615"
    fill="#ffffff"
    font-family="monospace"
    font-size="18"
    font-weight="bold"
  >
    ${totalStars}
  </text>


  <text
    x="760"
    y="595"
    fill="#39ff88"
    font-family="monospace"
    font-size="13"
  >
    FORKS
  </text>

  <text
    x="760"
    y="615"
    fill="#ffffff"
    font-family="monospace"
    font-size="18"
    font-weight="bold"
  >
    ${totalForks}
  </text>


  <text
    x="960"
    y="595"
    fill="#ff4d4d"
    font-family="monospace"
    font-size="13"
  >
    STATUS
  </text>

  <text
    x="960"
    y="615"
    fill="#39ff88"
    font-family="monospace"
    font-size="18"
    font-weight="bold"
  >
    ACTIVE
  </text>


  <!-- CURSOR ANIMATION -->

  <rect
    x="1135"
    y="486"
    width="8"
    height="15"
    fill="#00ff9c"
  >
    <animate
      attributeName="opacity"
      values="1;0;1"
      dur="1s"
      repeatCount="indefinite"
    />
  </rect>

</svg>
`;

fs.mkdirSync("dist", { recursive: true });

fs.writeFileSync(
  "dist/profile.svg",
  svg,
  "utf8"
);

console.log("====================================");
console.log(" Terminal Profile Generated");
console.log("====================================");
console.log("Username:", username);
console.log("Name:", name);
console.log("Repositories:", publicRepos);
console.log("Followers:", followers);
console.log("Stars:", totalStars);
console.log("Forks:", totalForks);
console.log("Languages:", topLanguages);
console.log("Output: dist/profile.svg");
console.log("====================================");
