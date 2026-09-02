import fs from "node:fs";

const username = process.env.GH_USERNAME;
const token = process.env.GH_TOKEN;

if (!username || !token) {
  throw new Error("GH_USERNAME and GH_TOKEN are required");
}

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "Vineeth1512-terminal-profile",
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

/* =========================================================
   DOWNLOAD GITHUB AVATAR
========================================================= */

async function downloadAvatar(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Vineeth1512-terminal-profile",
    },
  });

  if (!response.ok) {
    throw new Error(`Avatar download failed: ${response.status}`);
  }

  const contentType =
    response.headers.get("content-type") || "image/jpeg";

  const buffer = Buffer.from(await response.arrayBuffer());

  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

/* =========================================================
   ESCAPE XML
========================================================= */

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function clean(value = "", max = 70) {
  return escapeXml(
    String(value)
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max)
  );
}

/* =========================================================
   GET PROFILE
========================================================= */

const profile = await github(
  `https://api.github.com/users/${username}`
);

/* =========================================================
   GET REPOSITORIES
========================================================= */

const repos = await github(
  `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
);

/* =========================================================
   CALCULATE STARS
========================================================= */

const totalStars = repos.reduce(
  (total, repo) =>
    total + (repo.stargazers_count || 0),
  0
);

/* =========================================================
   CALCULATE FORKS
========================================================= */

const totalForks = repos.reduce(
  (total, repo) =>
    total + (repo.forks_count || 0),
  0
);

/* =========================================================
   CALCULATE LANGUAGES
========================================================= */

const languageCount = {};

for (const repo of repos) {
  if (!repo.language) continue;

  languageCount[repo.language] =
    (languageCount[repo.language] || 0) + 1;
}

const languages = Object.entries(languageCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6)
  .map(([language]) => language);

/* =========================================================
   PROFILE DATA
========================================================= */

const name = profile.name || username;

const bio =
  profile.bio ||
  "Full Stack Developer building modern web applications.";

const location =
  profile.location ||
  "India";

const repositories =
  profile.public_repos || 0;

const followers =
  profile.followers || 0;

const following =
  profile.following || 0;

/* =========================================================
   GET AVATAR
========================================================= */

const avatar = await downloadAvatar(
  profile.avatar_url
);

/* =========================================================
   SVG CONFIG
========================================================= */

const WIDTH = 1200;
const HEIGHT = 610;

/* =========================================================
   SVG
========================================================= */

const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${WIDTH}"
  height="${HEIGHT}"
  viewBox="0 0 ${WIDTH} ${HEIGHT}"
>

<defs>

  <!-- Main border -->
  <linearGradient
    id="borderGradient"
    x1="0"
    y1="0"
    x2="1"
    y2="1"
  >
    <stop
      offset="0%"
      stop-color="#00ffff"
    />

    <stop
      offset="50%"
      stop-color="#00ff9c"
    />

    <stop
      offset="100%"
      stop-color="#7047ff"
    />
  </linearGradient>


  <!-- Panel -->
  <linearGradient
    id="panelGradient"
    x1="0"
    y1="0"
    x2="1"
    y2="1"
  >

    <stop
      offset="0%"
      stop-color="#07101d"
    />

    <stop
      offset="100%"
      stop-color="#030812"
    />

  </linearGradient>


  <!-- Avatar filter -->
  <filter
    id="avatarFilter"
    x="-20%"
    y="-20%"
    width="140%"
    height="140%"
  >

    <feColorMatrix
      type="matrix"
      values="
        0.40 0.40 0.20 0 0
        0.40 0.40 0.20 0 0
        0.40 0.40 0.20 0 0
        0    0    0    1 0
      "
    />

  </filter>


  <!-- Glow -->
  <filter
    id="glow"
    x="-50%"
    y="-50%"
    width="200%"
    height="200%"
  >

    <feGaussianBlur
      stdDeviation="2"
      result="blur"
    />

    <feMerge>

      <feMergeNode
        in="blur"
      />

      <feMergeNode
        in="SourceGraphic"
      />

    </feMerge>

  </filter>


  <!-- Scanlines -->
  <pattern
    id="scanlines"
    width="4"
    height="8"
    patternUnits="userSpaceOnUse"
  >

    <rect
      width="4"
      height="2"
      fill="#00ffff"
      opacity="0.15"
    />

  </pattern>


  <!-- Dot matrix -->
  <pattern
    id="dots"
    width="7"
    height="7"
    patternUnits="userSpaceOnUse"
  >

    <circle
      cx="2"
      cy="2"
      r="1"
      fill="#00ffff"
      opacity="0.25"
    />

  </pattern>


  <!-- Avatar clip -->
  <clipPath
    id="avatarClip"
  >

    <rect
      x="60"
      y="95"
      width="390"
      height="320"
      rx="10"
    />

  </clipPath>

</defs>


<!-- =====================================================
     BACKGROUND
====================================================== -->

<rect
  x="0"
  y="0"
  width="${WIDTH}"
  height="${HEIGHT}"
  rx="20"
  fill="#02060d"
/>


<!-- Outer border -->

<rect
  x="3"
  y="3"
  width="${WIDTH - 6}"
  height="${HEIGHT - 6}"
  rx="19"
  fill="none"
  stroke="url(#borderGradient)"
  stroke-width="2"
/>


<!-- =====================================================
     TERMINAL HEADER
====================================================== -->

<circle
  cx="25"
  cy="25"
  r="7"
  fill="#ff4d56"
/>

<circle
  cx="48"
  cy="25"
  r="7"
  fill="#ffbd2e"
/>

<circle
  cx="71"
  cy="25"
  r="7"
  fill="#28ca42"
/>


<text
  x="600"
  y="30"
  text-anchor="middle"
  fill="#00ff9c"
  font-family="monospace"
  font-size="14"
  font-weight="bold"
>
terminal@${clean(username)}:~$ ./profile --live
</text>


<text
  x="1160"
  y="30"
  text-anchor="end"
  fill="#ff3fc8"
  font-family="monospace"
  font-size="11"
  font-weight="bold"
>
[ ONLINE ]
</text>


<!-- =====================================================
     LEFT PANEL
====================================================== -->

<rect
  x="25"
  y="52"
  width="430"
  height="390"
  rx="12"
  fill="url(#panelGradient)"
  stroke="#007b91"
  stroke-width="1"
/>


<text
  x="42"
  y="76"
  fill="#00ff9c"
  font-family="monospace"
  font-size="12"
  font-weight="bold"
>
&gt; VISUAL.INFO
</text>


<!-- Avatar container -->

<rect
  x="60"
  y="95"
  width="390"
  height="320"
  rx="10"
  fill="#02060c"
  stroke="#0b5067"
  stroke-width="1"
/>


<!-- REAL GITHUB AVATAR -->

<image
  href="${avatar}"
  x="60"
  y="95"
  width="390"
  height="320"
  preserveAspectRatio="xMidYMid slice"
  clip-path="url(#avatarClip)"
  filter="url(#avatarFilter)"
/>


<!-- Dot effect -->

<rect
  x="60"
  y="95"
  width="390"
  height="320"
  rx="10"
  fill="url(#dots)"
  clip-path="url(#avatarClip)"
/>


<!-- Scanline effect -->

<rect
  x="60"
  y="95"
  width="390"
  height="320"
  rx="10"
  fill="url(#scanlines)"
  clip-path="url(#avatarClip)"
/>


<!-- Moving scan -->

<rect
  x="60"
  y="95"
  width="390"
  height="2"
  fill="#00ffff"
  opacity="0.65"
  filter="url(#glow)"
>

  <animate
    attributeName="y"
    values="100;410;100"
    dur="4s"
    repeatCount="indefinite"
  />

</rect>


<!-- =====================================================
     RIGHT PANEL
====================================================== -->

<rect
  x="475"
  y="52"
  width="700"
  height="390"
  rx="12"
  fill="url(#panelGradient)"
  stroke="#007b91"
  stroke-width="1"
/>


<text
  x="495"
  y="76"
  fill="#00ff9c"
  font-family="monospace"
  font-size="12"
  font-weight="bold"
>
&gt; PROFILE.INFO
</text>


<!-- Name -->

<text
  x="495"
  y="110"
  fill="#00ff7f"
  font-family="monospace"
  font-size="25"
  font-weight="bold"
  filter="url(#glow)"
>
${clean(name, 35)}
</text>


<!-- Role -->

<text
  x="495"
  y="134"
  fill="#d7e3ef"
  font-family="monospace"
  font-size="12"
>
Full Stack Developer
<tspan fill="#00ff9c"> █</tspan>
</text>


<line
  x1="495"
  y1="150"
  x2="1148"
  y2="150"
  stroke="#124357"
/>


<!-- =====================================================
     BASIC INFORMATION
====================================================== -->

<text
  x="495"
  y="173"
  fill="#00d9ff"
  font-family="monospace"
  font-size="11"
>
Username
</text>

<text
  x="610"
  y="173"
  fill="#e5edf5"
  font-family="monospace"
  font-size="11"
>
: ${clean(username, 35)}
</text>


<text
  x="495"
  y="194"
  fill="#00d9ff"
  font-family="monospace"
  font-size="11"
>
Role
</text>

<text
  x="610"
  y="194"
  fill="#e5edf5"
  font-family="monospace"
  font-size="11"
>
: Full Stack Developer
</text>


<text
  x="495"
  y="215"
  fill="#00d9ff"
  font-family="monospace"
  font-size="11"
>
Location
</text>

<text
  x="610"
  y="215"
  fill="#e5edf5"
  font-family="monospace"
  font-size="11"
>
: ${clean(location, 35)}
</text>


<text
  x="495"
  y="236"
  fill="#00d9ff"
  font-family="monospace"
  font-size="11"
>
Repositories
</text>

<text
  x="610"
  y="236"
  fill="#e5edf5"
  font-family="monospace"
  font-size="11"
>
: ${repositories}
</text>


<text
  x="495"
  y="257"
  fill="#00d9ff"
  font-family="monospace"
  font-size="11"
>
Followers
</text>

<text
  x="610"
  y="257"
  fill="#e5edf5"
  font-family="monospace"
  font-size="11"
>
: ${followers}
</text>


<text
  x="495"
  y="278"
  fill="#00d9ff"
  font-family="monospace"
  font-size="11"
>
Following
</text>

<text
  x="610"
  y="278"
  fill="#e5edf5"
  font-family="monospace"
  font-size="11"
>
: ${following}
</text>


<!-- =====================================================
     TECH STACK
====================================================== -->

<line
  x1="495"
  y1="294"
  x2="1148"
  y2="294"
  stroke="#124357"
/>


<text
  x="495"
  y="316"
  fill="#00ff9c"
  font-family="monospace"
  font-size="12"
  font-weight="bold"
>
&gt; TECH.STACK
</text>


<text
  x="495"
  y="338"
  fill="#c084fc"
  font-family="monospace"
  font-size="10"
>
Core.Frontend
</text>

<text
  x="610"
  y="338"
  fill="#e5edf5"
  font-family="monospace"
  font-size="10"
>
: React • JavaScript • HTML • CSS
</text>


<text
  x="495"
  y="356"
  fill="#c084fc"
  font-family="monospace"
  font-size="10"
>
Core.Backend
</text>

<text
  x="610"
  y="356"
  fill="#e5edf5"
  font-family="monospace"
  font-size="10"
>
: Java • Spring Boot • Node.js
</text>


<text
  x="495"
  y="374"
  fill="#c084fc"
  font-family="monospace"
  font-size="10"
>
Core.Database
</text>

<text
  x="610"
  y="374"
  fill="#e5edf5"
  font-family="monospace"
  font-size="10"
>
: MongoDB • MySQL • Firebase
</text>


<text
  x="495"
  y="392"
  fill="#c084fc"
  font-family="monospace"
  font-size="10"
>
Core.Languages
</text>

<text
  x="610"
  y="392"
  fill="#e5edf5"
  font-family="monospace"
  font-size="10"
>
: ${clean(languages.join(" • ") || "JavaScript • Java", 65)}
</text>


<text
  x="495"
  y="416"
  fill="#00ff9c"
  font-family="monospace"
  font-size="9"
>
$ ${clean(bio, 75)}
</text>


<!-- =====================================================
     LIVE STATS
====================================================== -->

<rect
  x="25"
  y="460"
  width="1150"
  height="120"
  rx="12"
  fill="url(#panelGradient)"
  stroke="#00b889"
  stroke-width="1"
/>


<text
  x="42"
  y="484"
  fill="#00ff9c"
  font-family="monospace"
  font-size="12"
  font-weight="bold"
>
&gt; LIVE.STATS
</text>


<!-- Repositories -->

<text
  x="75"
  y="514"
  fill="#00d9ff"
  font-family="monospace"
  font-size="9"
>
PUBLIC.REPOS
</text>

<text
  x="75"
  y="540"
  fill="#ffffff"
  font-family="monospace"
  font-size="20"
  font-weight="bold"
>
${repositories}
</text>


<!-- Followers -->

<text
  x="290"
  y="514"
  fill="#00d9ff"
  font-family="monospace"
  font-size="9"
>
FOLLOWERS
</text>

<text
  x="290"
  y="540"
  fill="#ffffff"
  font-family="monospace"
  font-size="20"
  font-weight="bold"
>
${followers}
</text>


<!-- Stars -->

<text
  x="500"
  y="514"
  fill="#ffd43b"
  font-family="monospace"
  font-size="9"
>
STARS
</text>

<text
  x="500"
  y="540"
  fill="#ffffff"
  font-family="monospace"
  font-size="20"
  font-weight="bold"
>
${totalStars}
</text>


<!-- Forks -->

<text
  x="670"
  y="514"
  fill="#c084fc"
  font-family="monospace"
  font-size="9"
>
FORKS
</text>

<text
  x="670"
  y="540"
  fill="#ffffff"
  font-family="monospace"
  font-size="20"
  font-weight="bold"
>
${totalForks}
</text>


<!-- Languages -->

<text
  x="835"
  y="514"
  fill="#ff4fd8"
  font-family="monospace"
  font-size="9"
>
LANGUAGES
</text>

<text
  x="835"
  y="540"
  fill="#ffffff"
  font-family="monospace"
  font-size="10"
>
${clean(languages.slice(0, 3).join(" • ") || "JavaScript", 30)}
</text>


<!-- Status -->

<text
  x="1050"
  y="514"
  fill="#39ff88"
  font-family="monospace"
  font-size="9"
>
STATUS
</text>

<text
  x="1050"
  y="540"
  fill="#39ff88"
  font-family="monospace"
  font-size="15"
  font-weight="bold"
  filter="url(#glow)"
>
ACTIVE
</text>


<!-- =====================================================
     TERMINAL FOOTER
====================================================== -->

<text
  x="42"
  y="564"
  fill="#00ff9c"
  font-family="monospace"
  font-size="9"
>
$ live github data loaded • auto-generated by GitHub Actions
</text>


<!-- Blinking cursor -->

<rect
  x="1150"
  y="556"
  width="6"
  height="10"
  fill="#00ff9c"
>

  <animate
    attributeName="opacity"
    values="1;0;1"
    dur="0.9s"
    repeatCount="indefinite"
  />

</rect>

</svg>
`;

/* =========================================================
   WRITE SVG
========================================================= */

fs.mkdirSync("dist", {
  recursive: true,
});

fs.writeFileSync(
  "dist/profile.svg",
  svg,
  "utf8"
);

/* =========================================================
   LOG
========================================================= */

console.log("");
console.log("==========================================");
console.log(" TERMINAL GITHUB PROFILE GENERATED");
console.log("==========================================");
console.log(`Username     : ${username}`);
console.log(`Name         : ${name}`);
console.log(`Location     : ${location}`);
console.log(`Repositories : ${repositories}`);
console.log(`Followers    : ${followers}`);
console.log(`Following    : ${following}`);
console.log(`Stars        : ${totalStars}`);
console.log(`Forks        : ${totalForks}`);
console.log(
  `Languages    : ${languages.join(", ")}`
);
console.log("Output       : dist/profile.svg");
console.log("==========================================");
console.log("");
