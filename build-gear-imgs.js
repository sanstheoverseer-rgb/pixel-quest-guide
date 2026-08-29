// build-gear-imgs.js
// Reads all img/ filenames and gear IDs from dps-calculator.html,
// matches them, and injects a GEAR_IMG table into the HTML.
// Run: node build-gear-imgs.js

const fs = require("fs");
const path = require("path");

const IMG_DIR = path.join(__dirname, "img");
const HTML_FILE = path.join(__dirname, "dps-calculator.html");

const html = fs.readFileSync(HTML_FILE, "utf8");

// Extract gear entries (slot: "secondary" | "armor" | "accessory")
const gearRe = /\{\s*id:\s*"([^"]+)"[^}]+slot:\s*"(secondary|armor|accessory)"/g;
const gear = [];
let m;
while ((m = gearRe.exec(html)) !== null) {
  const snippet = html.slice(m.index, m.index + 300);
  const nm = snippet.match(/name:\s*"([^"]+)"/);
  if (nm) gear.push({ id: m[1], name: nm[1], slot: m[2] });
}
console.log("Found " + gear.length + " gear items.");

// Build file map: normalised key -> filename
const files = fs.readdirSync(IMG_DIR).filter(f => f.startsWith("Item_") && f.endsWith(".png"));
const fileMap = {};
files.forEach(f => {
  const bare = f.replace(/^Item_/, "").replace(/_\d+\.png$/, "");
  const key = bare.replace(/-/g, " ").toLowerCase();
  fileMap[key] = f;
});

// Normalise a name for matching
function norm(s) {
  return s.toLowerCase()
    .replace(/['']/g, "")   // remove apostrophes
    .replace(/\s+/g, " ")
    .trim();
}

// Also build a no-apostrophe version of fileMap
const fileMapNoApos = {};
Object.entries(fileMap).forEach(([k, v]) => {
  fileMapNoApos[norm(k)] = v;
});

const lookup = {};
const unmatched = [];

gear.forEach(g => {
  const candidates = [
    norm(g.name),
    g.name.toLowerCase().replace(/\s+/g, " "),
  ];
  let found = null;
  for (const c of candidates) {
    if (fileMapNoApos[c]) { found = fileMapNoApos[c]; break; }
    if (fileMap[c]) { found = fileMap[c]; break; }
  }
  if (found) lookup[g.id] = found;
  else unmatched.push(g.id + " (" + g.name + ")");
});

console.log("Matched " + Object.keys(lookup).length + " gear items.");
if (unmatched.length) console.log("Unmatched:\n  " + unmatched.join("\n  "));

// Inject into HTML — replace or append GEAR_IMG block
const entries = Object.keys(lookup).sort().map(id =>
  "    " + id.padEnd(35) + ': "' + lookup[id] + '",'
).join("\n");
const block = `  var GEAR_IMG = {\n${entries}\n  };`;

let updated;
if (html.includes("var GEAR_IMG = {")) {
  updated = html.replace(/  var GEAR_IMG = \{[\s\S]*?\};/, block);
} else {
  // Insert right after WEAPON_IMG block
  updated = html.replace(/(  var WEAPON_IMG = \{[\s\S]*?\};)/, "$1\n\n" + block);
}

fs.writeFileSync(HTML_FILE, updated, "utf8");
console.log("Injected GEAR_IMG into dps-calculator.html.");
