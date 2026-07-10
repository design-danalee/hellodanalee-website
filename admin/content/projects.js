// Load/serialize case-study markdown files. Slug (= filename) drives the URL
// via src/projects/projects.11tydata.js, so creating a project = choosing a slug.
import { parseFrontmatter, stringifyFrontmatter } from "@/content/frontmatter.js";

export const PROJECTS_DIR = "src/projects";

export function projectPath(slug) {
  return `${PROJECTS_DIR}/${slug}.md`;
}

export function makeProjects(contents) {
  return {
    async list() {
      const entries = await contents.list(PROJECTS_DIR);
      const mdFiles = entries.filter(
        (e) => e.type === "file" && e.name.endsWith(".md")
      );
      const out = [];
      for (const f of mdFiles) {
        const { text, sha } = await contents.read(f.path);
        const { data, body } = parseFrontmatter(text);
        out.push({
          slug: f.name.replace(/\.md$/, ""),
          path: f.path,
          sha,
          data,
          body,
        });
      }
      out.sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
      return out;
    },
  };
}

export function serializeProject(project) {
  return stringifyFrontmatter(project.data, project.body || "");
}

export function slugify(title) {
  return String(title || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// A fresh project skeleton (fields in template order).
export function blankProject(slug, title) {
  return {
    slug,
    path: projectPath(slug),
    sha: null,
    body: "",
    data: {
      order: 99,
      title: title || "Untitled",
      card_image: "",
      card_title: title || "Untitled",
      card_tagline: "",
      hero_image: "",
      description: "",
      capabilities: [],
      meta: [],
      sections: [],
    },
  };
}
