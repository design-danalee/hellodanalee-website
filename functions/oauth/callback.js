// Step 2 of the GitHub OAuth dance — Cloudflare Pages Function.
// Replaces oauth/callback.php: exchanges the code for a token via a direct
// fetch() (no cURL needed) and returns the identical postMessage handshake
// admin/auth/oauth.js already expects, so the client doesn't need to change.

function parseCookie(header, name) {
  for (const part of (header || "").split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const cookieState = parseCookie(request.headers.get("Cookie"), "oauth_state");
  const stateOk = state !== "" && cookieState && timingSafeEqual(cookieState, state);

  let token = null;
  let error = null;

  if (!code || !stateOk) {
    error = "Invalid OAuth request (missing code or bad state).";
  } else {
    const redirectUri = `${url.origin}/oauth/callback`;
    try {
      const resp = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: env.GH_OAUTH_CLIENT_ID,
          client_secret: env.GH_OAUTH_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri,
        }),
      });
      const data = await resp.json();
      token = data.access_token || null;
      if (!token) {
        error =
          "GitHub did not return a token: " +
          (data.error_description || "unknown error");
      }
    } catch (e) {
      error = "Could not reach GitHub: " + e.message;
    }
  }

  // Build the message admin/auth/oauth.js expects on its window.
  const content = token
    ? "authorization:github:success:" +
      JSON.stringify({ token, provider: "github" })
    : "authorization:github:error:" + JSON.stringify({ message: error });

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Authorizing…</title></head>
<body>
<p>Completing sign-in… you can close this window if it doesn't close on its own.</p>
<script>
(function () {
    function receiveMessage(e) {
        window.opener.postMessage(${JSON.stringify(content)}, e.origin);
        window.removeEventListener('message', receiveMessage, false);
    }
    window.addEventListener('message', receiveMessage, false);
    // Tell the opener (admin) we're ready; it replies and we send the token above.
    window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body>
</html>`;

  const headers = new Headers({ "Content-Type": "text/html; charset=utf-8" });
  // One-time use — expire the state cookie now that it's been checked.
  headers.append(
    "Set-Cookie",
    "oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/oauth"
  );

  return new Response(html, { status: 200, headers });
}
