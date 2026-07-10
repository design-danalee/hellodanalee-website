// Read-only content access via the GitHub Contents API. Works unauthenticated
// for the public repo (login is only needed to commit).
import { CONFIG } from "@/config.js";

function b64Utf8Decode(b64) {
  const bin = atob((b64 || "").replace(/\n/g, ""));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

export function makeContents(client) {
  const base = `/repos/${CONFIG.owner}/${CONFIG.repo}/contents`;
  const ref = `?ref=${CONFIG.branch}`;
  return {
    // List a directory -> array of {name, path, type, ...}
    async list(dir) {
      return client.api(`${base}/${dir}${ref}`);
    },
    // Read a text file -> {text, sha}
    async read(path) {
      const r = await client.api(`${base}/${encodeURI(path)}${ref}`);
      return { text: b64Utf8Decode(r.content), sha: r.sha };
    },
  };
}
