// Copy the example's <style> text into the #css pane, stripping the
// indentation it has from sitting inside the HTML, and wrap each token
// in a <span> so viewer.css can color it.
const lines = document.getElementById("css-code").textContent.split("\n");

while (lines.length && !lines[0].trim()) lines.shift();
while (lines.length && !lines[lines.length - 1].trim()) lines.pop();

const indent = Math.min(
  ...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length),
);

const css = lines.map((l) => l.slice(indent)).join("\n");

const escape = (s) =>
  s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

const span = (kind, text) => `<span class="tok-${kind}">${escape(text)}</span>`;

// Alternatives, tried in order at each position:
//   1. /* comment */
//   2. @rule name
//   3. selector (anything up to a "{")
//   4. property : value (up to a ";" or "}")
//   5. punctuation { } ;
const token =
  /(\/\*[\s\S]*?\*\/)|(@[\w-]+)|([^\s{};][^{};]*?)(?=\s*\{)|([\w-]+)(\s*:\s*)([^;{}]+?)(?=\s*[;}])|([{};])/g;

let html = "";
let last = 0;
let m;

while ((m = token.exec(css))) {
  html += escape(css.slice(last, m.index));
  if (m[1]) html += span("comment", m[1]);
  else if (m[2]) html += span("at-rule", m[2]);
  else if (m[3]) html += span("selector", m[3]);
  else if (m[4]) html += span("property", m[4]) + escape(m[5]) + span("value", m[6]);
  else html += span("punct", m[7]);
  last = token.lastIndex;
}
html += escape(css.slice(last));

document.getElementById("css").innerHTML = html;
