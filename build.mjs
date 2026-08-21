import { mkdir, readFile, writeFile } from "node:fs/promises";

const [html, css, js, backendWorker] = await Promise.all([
  readFile(new URL("./index.html", import.meta.url), "utf8"),
  readFile(new URL("./styles.css", import.meta.url), "utf8"),
  readFile(new URL("./app.js", import.meta.url), "utf8"),
  readFile(new URL("./backend-worker.js", import.meta.url), "utf8"),
]);

const files = {
  "/": { type: "text/html; charset=utf-8", body: html },
  "/index.html": { type: "text/html; charset=utf-8", body: html },
  "/styles.css": { type: "text/css; charset=utf-8", body: css },
  "/app.js": { type: "text/javascript; charset=utf-8", body: js },
};

const worker = `const files = ${JSON.stringify(files)};
\n${backendWorker}`;

await mkdir(new URL("./dist/server/", import.meta.url), { recursive: true });
await mkdir(new URL("./dist/.openai/", import.meta.url), { recursive: true });
await writeFile(new URL("./dist/server/index.js", import.meta.url), worker);

let hosting = { d1: null, r2: null };
try {
  hosting = JSON.parse(await readFile(new URL("./.openai/hosting.json", import.meta.url), "utf8"));
} catch {
  // The project ID is added when the private site is first created.
}
await writeFile(new URL("./dist/.openai/hosting.json", import.meta.url), JSON.stringify(hosting, null, 2));

console.log("PT.SMM Digital Automation Dashboard build complete");
