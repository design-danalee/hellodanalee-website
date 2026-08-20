import { onRequestGet as __oauth_auth_js_onRequestGet } from "/Users/danalee/Documents/Personal/hellodanalee/hellodanalee-website/functions/oauth/auth.js"
import { onRequestGet as __oauth_callback_js_onRequestGet } from "/Users/danalee/Documents/Personal/hellodanalee/hellodanalee-website/functions/oauth/callback.js"

export const routes = [
    {
      routePath: "/oauth/auth",
      mountPath: "/oauth",
      method: "GET",
      middlewares: [],
      modules: [__oauth_auth_js_onRequestGet],
    },
  {
      routePath: "/oauth/callback",
      mountPath: "/oauth",
      method: "GET",
      middlewares: [],
      modules: [__oauth_callback_js_onRequestGet],
    },
  ]