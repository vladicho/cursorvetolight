const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");
const staticFiles = ["index.html", "tutorial.html", "tutorial-video.html", "styles.css", "skimage-worker.js"];
const jsEntries = ["app.js"];

async function build() {
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist, { recursive: true });

  for (const file of jsEntries) {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    const result = await esbuild.transform(source, {
      sourcefile: file,
      minify: true,
      legalComments: "none",
      target: "es2020",
      format: "iife",
      sourcemap: false,
      drop: ["console", "debugger"],
    });
    fs.writeFileSync(path.join(dist, file), result.code);
  }

  const buildInfo = {
    builtAt: new Date().toISOString(),
    commit: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || "local",
  };
  const version = Date.now();

  for (const file of staticFiles) {
    let content = fs.readFileSync(path.join(root, file), "utf8");
    if (file.endsWith(".html")) {
      // Inject cache-busting version into JS and CSS references
      content = content
        .replace(/(href="styles\.css)(")/g, `$1?v=${version}$2`)
        .replace(/(src="app\.js)(")/g, `$1?v=${version}$2`);
    }
    fs.writeFileSync(path.join(dist, file), content);
  }

  fs.writeFileSync(path.join(dist, "build.json"), JSON.stringify(buildInfo));

  const appSize = fs.statSync(path.join(dist, "app.js")).size;
  console.log(`Frontend de producao gerado em ${dist} (app.js ${appSize} bytes, version=${version})`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});

