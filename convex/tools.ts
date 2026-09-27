declare const process: { env: Record<string, string | undefined> };

const VIKTOR_API_URL = process.env.VIKTOR_SPACES_API_URL!;
const PROJECT_NAME = process.env.VIKTOR_SPACES_PROJECT_NAME!;
const PROJECT_SECRET = process.env.VIKTOR_SPACES_PROJECT_SECRET!;

export async function callTool<T>(
  role: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const response = await fetch(
    `${VIKTOR_API_URL}/api/viktor-spaces/tools/call`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_name: PROJECT_NAME,
        project_secret: PROJECT_SECRET,
        role,
        arguments: args,
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error ?? "Tool call failed");
  }
  return json.result as T;
}

export const REPO = "trust-company-ai/community";
export const REPO_WEB = `https://github.com/${REPO}/blob/main/`;

/**
 * Call the GitHub REST API directly. Works unauthenticated for public repos;
 * set the Convex env var GITHUB_TOKEN (read-only token) while the repo is private.
 */
export async function gh(path: string, raw = false): Promise<string> {
  const headers: Record<string, string> = {
    Accept: raw ? "application/vnd.github.raw" : "application/vnd.github+json",
    "User-Agent": "trust-company-ai-knowledge-chat",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(`https://api.github.com/${path}`, { headers });
  if (!r.ok)
    throw new Error(
      `GitHub ${r.status} for ${path}: ${(await r.text()).slice(0, 200)}`,
    );
  return await r.text();
}
