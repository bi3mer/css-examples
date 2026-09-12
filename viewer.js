// Load the example named in the URL (viewer.html?css=rect loads
// examples/rect.css), apply it to the page, and show its source in the
// #css pane with each token wrapped in a <span> so viewer.css can color it.
// An optional &elements=<n> clones the div so there are n of them. Every
// copy has the class "element" plus its own number: element1, element2, ...
const params = new URLSearchParams(location.search);
const name = params.get("css");
const elements = Number(params.get("elements")) || 1;

const viewer = document.getElementById("viewer");
for (let i = 2; i <= elements; i++) {
  const copy = viewer.firstElementChild.cloneNode();
  copy.className = `element element${i}`;
  viewer.append(copy);
}

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

const highlight = (css) => {
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
  return html + escape(css.slice(last));
};

const show = (css) => {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);

  document.title = name;
  document.getElementById("css").innerHTML = highlight(css.trim());
};

const fail = (message) => {
  document.getElementById("css").textContent = message;
};

if (!name) {
  fail("No example given. Open this page as viewer.html?css=<name>.");
} else {
  fetch(`examples/${name}.css`)
    .then((res) => (res.ok ? res.text() : Promise.reject(res.status)))
    .then(show)
    .catch((err) => fail(`Could not load examples/${name}.css (${err}).`));
}
