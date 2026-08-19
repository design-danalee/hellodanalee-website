// Step 1 of the GitHub OAuth dance — Cloudflare Pages Function.
// Replaces oauth/auth.php: same redirect, same query params. The CSRF `state`
// lives in a short-lived HttpOnly cookie instead of a PHP session, since Pages
// Functions are stateless between requests.

function randomState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function onRequestGet({ request, env }) {
  const clientId = env.GH_OAUTH_CLIENT_ID;
  if (!clientId) {
    return new Response(
      "OAuth is not configured: GH_OAUTH_CLIENT_ID is missing.",
      { status: 500 }
    );
  }
  const scope = env.GH_OAUTH_CLIENT_SCOPE || "repo";

  const state = randomState();
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/oauth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
    allow_signup: "false",
  });

  const headers = new Headers({
    Location: `https://github.com/login/oauth/authorize?${params.toString()}`,
  });
  headers.append(
    "Set-Cookie",
    `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=300; Path=/oauth`
  );

  return new Response(null, { status: 302, headers });
}
