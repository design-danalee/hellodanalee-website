// Repo + site configuration for the custom CMS.
// Mirrors the old Decap backend block (design-danalee/hellodanalee-website @ main).
export const CONFIG = {
  owner: "design-danalee",
  repo: "hellodanalee-website",
  branch: "main",
  // Assets are published at the same origin the CMS runs on — no hardcoded
  // domain, so this works correctly whether you're testing on a Cloudflare
  // preview address or on the real live domain.
  get siteOrigin() {
    return location.origin;
  },
  // Where uploaded media is committed in the repo.
  mediaDir: "assets",
  // OAuth proxy endpoint (Cloudflare Pages Function), served from the same origin.
  authEndpoint: "/oauth/auth",
  // Video upload guardrails (bytes).
  videoWarnBytes: 10 * 1024 * 1024,
  videoBlockBytes: 25 * 1024 * 1024,
};
