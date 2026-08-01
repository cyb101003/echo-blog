import { readFile, writeFile } from "node:fs/promises";

const username = "cyb101003";
const outputUrl = new URL("../src/data/github.json", import.meta.url);

const request = async path => {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "echo-blog-build"
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const response = await fetch(`https://api.github.com/${path}`, { headers });
  if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
  return response.json();
};

const getKind = repo => {
  if (repo.archived) return "archived";
  if (repo.is_template) return "template";
  if (repo.mirror_url) return "mirror";
  return repo.fork ? "fork" : "original";
};

try {
  const [profile, repos] = await Promise.all([
    request(`users/${username}`),
    request(`users/${username}/repos?per_page=100&sort=updated&type=public`)
  ]);

  const repositories = repos
    .filter(repo => !repo.private)
    .map(repo => ({
      id: repo.id,
      name: repo.name,
      url: repo.html_url,
      description: repo.description || "这个仓库暂时还没有填写简介。",
      language: repo.language,
      topics: repo.topics || [],
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      kind: getKind(repo),
      fork: repo.fork,
      archived: repo.archived,
      template: repo.is_template,
      mirror: Boolean(repo.mirror_url),
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at
    }))
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "original" ? -1 : 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  const payload = {
    syncedAt: new Date().toISOString(),
    profile: {
      login: profile.login,
      htmlUrl: profile.html_url,
      publicRepos: profile.public_repos,
      followers: profile.followers
    },
    repositories
  };

  await writeFile(outputUrl, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Synced ${repositories.length} public repositories for ${username}.`);
} catch (error) {
  try {
    const cached = JSON.parse(await readFile(outputUrl, "utf8"));
    if (!cached.repositories?.length) throw new Error("cache is empty");
    console.warn(`GitHub sync failed; using ${cached.repositories.length} cached repositories.`);
  } catch {
    console.error("GitHub sync failed and no usable cache exists.");
    throw error;
  }
}
