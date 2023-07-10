import ExpiryMap from "expiry-map";

const KEY_ACCESS_TOKEN = "accessToken";
const cache = new ExpiryMap(10 * 1000);

async function request(
  token: string,
  method: string,
  path: string,
  data?: unknown
) {
  return fetch(`https://chat.openai.com/backend-api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
}

export async function getChatGPTAccessToken(): Promise<string> {
  if (cache.get(KEY_ACCESS_TOKEN)) {
    return cache.get(KEY_ACCESS_TOKEN);
  }
  const resp = await fetch("https://chat.openai.com/api/auth/session");
  if (resp.status === 403) {
    throw new Error("CLOUDFLARE");
  }
  const data = await resp.json().catch(() => ({}));
  if (!data.accessToken) {
    throw new Error("UNAUTHORIZED");
  }
  cache.set(KEY_ACCESS_TOKEN, data.accessToken);
  return data.accessToken;
}

async function fetchModels(
  token
): Promise<
  { slug: string; title: string; description: string; max_tokens: number }[]
> {
  const resp = await request(token, "GET", "/models").then((r) => r.json());
  return resp.models;
}
