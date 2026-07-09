// ============================================================================
// Decap CMS live-preview customization
// ----------------------------------------------------------------------------
// Makes the editor's preview pane look like the real published page:
//   1. Loads the actual site stylesheets into the preview iframe.
//   2. Adds the handful of Tailwind grid utilities the project template uses
//      (Decap's preview iframe doesn't run the Tailwind CDN script).
//   3. Registers a custom preview template for the Projects collection that
//      mirrors src/_includes/layouts/project.njk.
// ============================================================================

(function () {
  var h = window.h;

  // --- 1. Real site CSS (absolute paths so they resolve from the site root) ---
  CMS.registerPreviewStyle("/main.css");
  CMS.registerPreviewStyle("/size-small.css");
  CMS.registerPreviewStyle("/size-large.css");
  CMS.registerPreviewStyle("/index.css");

  // --- 2. Minimal Tailwind-equivalent utilities used by the project layout,
  //        plus a little breathing room and the web fonts. (raw CSS) ---
  CMS.registerPreviewStyle(
    [
      "@import url('https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;700&display=swap');",
      "body{padding:1.5rem;cursor:auto;}",
      "*{cursor:auto !important;}",
      ".grid{display:grid;}",
      ".grid-cols-6{grid-template-columns:repeat(6,minmax(0,1fr));}",
      ".gap-4{gap:1rem;}",
      ".px-4{padding-left:1rem;padding-right:1rem;}",
      ".mt-16{margin-top:4rem;}",
      ".mt-1{margin-top:0.25rem;}",
      ".col-span-6{grid-column:span 6/span 6;}",
      "@media (min-width:768px){",
      ".md\\:col-span-3{grid-column:span 3/span 3;}",
      ".md\\:col-span-6{grid-column:span 6/span 6;}",
      ".md\\:pr-8{padding-right:2rem;}",
      "}",
    ].join("\n"),
    { raw: true }
  );

  // --- helper: resolve an image/file path through Decap so freshly uploaded
  //     (not-yet-saved) assets also show in the preview. ---
  function asset(getAsset, path) {
    if (!path) return "";
    try {
      return String(getAsset(path) || "");
    } catch (e) {
      return path;
    }
  }

  // --- render one row inside a `grid grid-cols-6` section ---
  function renderRow(getAsset, row, key) {
    var type = row.type;
    var src = asset(getAsset, row.src);

    if (type === "text_half") {
      return h(
        "div",
        { key: key, className: "project-caption col-span-6 md:col-span-3" },
        h("p", null, row.text || "")
      );
    }
    if (type === "video_half") {
      return h("video", {
        key: key,
        className: "project-image roundy col-span-6 md:col-span-3",
        src: src,
        style: { objectFit: "cover" },
        autoPlay: true,
        loop: true,
        muted: true,
        playsInline: true,
      });
    }
    if (type === "image_half") {
      return h("div", {
        key: key,
        className:
          "project-image roundy col-span-6 md:col-span-3" +
          (row.fit ? " " + row.fit : "") +
          (row.zoom ? " " + row.zoom : ""),
        style: { backgroundImage: "url('" + src + "')" },
      });
    }
    if (type === "video_full") {
      return h(
        "div",
        {
          key: key,
          className:
            "wide-project-image roundy col-span-6 md:col-span-6" +
            (row.natural_height ? " wide-project-image--natural" : ""),
        },
        h(
          "video",
          { autoPlay: true, loop: true, muted: true, playsInline: true },
          h("source", { src: src, type: "video/mp4" })
        )
      );
    }
    if (type === "image_full_natural") {
      return h(
        "div",
        { key: key, className: "roundy col-span-6 md:col-span-6" },
        h("img", {
          src: src,
          alt: row.alt || "",
          style: { width: "100%", height: "auto", objectFit: "cover" },
        })
      );
    }
    // image_full (default)
    return h("div", {
      key: key,
      className:
        "wide-project-image roundy col-span-6 md:col-span-6" +
        (row.fit ? " " + row.fit : ""),
      style: { backgroundImage: "url('" + src + "')" },
    });
  }

  // --- 3. Project preview template (mirrors layouts/project.njk) ---
  var ProjectPreview = function (props) {
    var data = props.entry.get("data").toJS();
    var getAsset = props.getAsset;

    var capabilities = data.capabilities || [];
    var meta = data.meta || [];
    var sections = data.sections || [];

    return h(
      "div",
      null,

      // Hero image
      h("div", {
        className: "wide-project-image",
        style: {
          backgroundImage: "url('" + asset(getAsset, data.hero_image) + "')",
        },
      }),

      // Title / description / capabilities / meta
      h(
        "section",
        { className: "section-intro" },
        h(
          "div",
          { className: "col-title" },
          h("p", { className: "hero-text mt-1" }, data.title || "")
        ),
        h(
          "div",
          { className: "project-details col-description" },
          h("p", { className: "hero" }, data.description || "")
        ),
        h("div", { className: "col-title" }),
        h(
          "div",
          { className: "col-description" },
          h(
            "div",
            { className: "project-capabilities" },
            h(
              "ul",
              null,
              capabilities.map(function (c, i) {
                return h("li", { key: "cap" + i }, c);
              })
            )
          ),
          h(
            "div",
            { className: "project-capabilities" },
            h(
              "ul",
              null,
              meta.map(function (m, i) {
                return h("li", { key: "meta" + i }, m);
              })
            )
          )
        )
      ),

      // Content sections
      sections.map(function (section, si) {
        var blocks = [];
        if (section.heading) {
          blocks.push(
            h(
              "section",
              { key: "head" + si, className: "section-intro" },
              h(
                "div",
                { className: "col-span-6 md:col-span-3" },
                h("h1", { className: "hero-text" }, section.heading)
              ),
              h(
                "div",
                {
                  className:
                    "project-details col-span-6 md:col-span-3 md:pr-8",
                },
                h("p", null, section.body || "")
              )
            )
          );
        }
        var rows = section.rows || [];
        if (rows.length) {
          blocks.push(
            h(
              "section",
              {
                key: "rows" + si,
                className: "grid grid-cols-6 gap-4 px-4 mt-16",
              },
              rows.map(function (row, ri) {
                return renderRow(getAsset, row, "r" + si + "-" + ri);
              })
            )
          );
        }
        return h("div", { key: "sec" + si }, blocks);
      })
    );
  };

  CMS.registerPreviewTemplate("projects", ProjectPreview);
})();
