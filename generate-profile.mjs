
const username = process.env.GH_USERNAME;
const token = process.env.GH_TOKEN;

if (!username || !token) {
  throw new Error("GH_USERNAME and GH_TOKEN are required");
}

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "Vineeth1512-profile-generator"
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

const profile = await github(
  `https://api.github.com/users/${username}`
);

console.log("GitHub Profile:");
console.log("Name:", profile.name);
console.log("Username:", profile.login);
console.log("Bio:", profile.bio);
console.log("Repositories:", profile.public_repos);
console.log("Followers:", profile.followers);
console.log("Following:", profile.following);
