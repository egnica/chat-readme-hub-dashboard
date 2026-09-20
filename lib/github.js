const OWNER = "egnica";
const REPO = "chat-readme-hub";
const BRANCH = "main";
const CONTENTS_API = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

function headers() {
  const token = process.env.GITHUB_TOKEN?.trim();
  const result = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (token) {
    result.Authorization = `Bearer ${token}`;
  }

  return result;
}

function requireToken() {
  if (!process.env.GITHUB_TOKEN?.trim()) {
    const error = new Error("GITHUB_TOKEN is not available to the server runtime.");
    error.status = 500;
    throw error;
  }
}

function validatePath(path) {
  if (typeof path !== "string" || !/^[a-zA-Z0-9._-]+\.md$/i.test(path)) {
    const error = new Error("Invalid Markdown file path.");
    error.status = 400;
    throw error;
  }
}

async function githubRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers(),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || `GitHub request failed with status ${response.status}.`);
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function listMarkdownFiles() {
  const data = await githubRequest(`${CONTENTS_API}?ref=${BRANCH}`);

  if (!Array.isArray(data)) {
    throw new Error("Unexpected response from GitHub.");
  }

  return data
    .filter((item) => item.type === "file" && item.name.toLowerCase().endsWith(".md"))
    .map((item) => ({
      name: item.name,
      path: item.path,
      sha: item.sha,
      size: item.size,
      htmlUrl: item.html_url,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getMarkdownFile(path) {
  validatePath(path);
  const data = await githubRequest(`${CONTENTS_API}/${encodeURIComponent(path)}?ref=${BRANCH}`);

  if (data.type !== "file" || typeof data.content !== "string") {
    const error = new Error("GitHub did not return a Markdown file.");
    error.status = 404;
    throw error;
  }

  return {
    name: data.name,
    path: data.path,
    sha: data.sha,
    size: data.size,
    htmlUrl: data.html_url,
    content: Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8"),
  };
}

export async function updateMarkdownFile(path, content, sha) {
  requireToken();
  validatePath(path);

  if (typeof content !== "string" || typeof sha !== "string" || !sha) {
    const error = new Error("File content and SHA are required.");
    error.status = 400;
    throw error;
  }

  const data = await githubRequest(`${CONTENTS_API}/${encodeURIComponent(path)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Update ${path} from mobile dashboard`,
      content: Buffer.from(content, "utf8").toString("base64"),
      sha,
      branch: BRANCH,
    }),
  });

  return {
    sha: data.content?.sha || sha,
    commitSha: data.commit?.sha || null,
  };
}

export async function deleteMarkdownFile(path, sha) {
  requireToken();
  validatePath(path);

  if (typeof sha !== "string" || !sha) {
    const error = new Error("File SHA is required.");
    error.status = 400;
    throw error;
  }

  const data = await githubRequest(`${CONTENTS_API}/${encodeURIComponent(path)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Delete ${path} from mobile dashboard`,
      sha,
      branch: BRANCH,
    }),
  });

  return { commitSha: data.commit?.sha || null };
}
