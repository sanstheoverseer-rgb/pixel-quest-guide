// clean-notes.js — strips AI/editorial commentary from notes fields and footer
const fs = require("fs");
const file = "dps-calculator.html";
let html = fs.readFileSync(file, "utf8");

// 1. Nuke the big footer paragraph
html = html.replace(/<p class="footer-note">[\s\S]*?<\/p>/, "");

// 2. Clean notes fields — run a series of regex replacements
// each entry: [pattern, replacement]
const fixes = [
  // spreadsheet references
  [/\s*\(spreadsheet base DPS confirms x\d+\)/g, ""],
  [/\s*\(spreadsheet\)/g, ""],
  [/,?\s*per spreadsheet\.?/g, ""],
  [/\.?\s*Base damage corrected to[\d\s\-–]+(?:per spreadsheet)?\.?/g, ""],
  [/\.?\s*Base damage corrected to[\d\s\-–,]+(?:range to \d+)?(?:[,.]?\s*per spreadsheet)?\.?/g, ""],
  [/,?\s*range to \d+[,.]?\s*per spreadsheet\.?/g, ""],
  [/,?\s*corrected to [\d\-–\s]+(?:per spreadsheet)?\.?/g, ""],
  [/,?\s*corrected from spreadsheet\.?/g, ""],
  [/\s*\(corrected[^)]*\)/g, ""],
  // guide script references
  [/\s*per the guide script\.?/g, ""],
  [/\s*—\s*this is the guide script[''s]*[^.]*\./g, ""],
  [/\s*\(this is the guide script[^)]*\)/g, ""],
  [/\s*mentioned in the guide script[^.]*\./g, ""],
  [/\s*—\s*mentioned in the guide script[^.]*\./g, ""],
  // editorial opinions
  [/\s*Do NOT recommend[^.]+\./g, ""],
  [/\s*it'?s genuinely bad[^.]*\./g, ""],
  [/\s*—\s*see script notes\.?/g, ""],
  [/\s*High risk pick[^.]*\./g, ""],
  // starter labels
  [/^Beach starter sword\.?\s*/g, ""],
  [/\.\s*Tier \d+ starter\.?/g, ""],
  [/\.\s*Tier \d+ lava\/corrupted-tier drop set\.?/g, ""],
  // accessory tier picks
  [/\s*Only shines paired with[^.]+\./g, ""],
  [/\s*Dominates the Mid Game tier[^.]*\./g, ""],
  [/\s*Budget accessory pick[^.]*\./g, ""],
  [/\s*Tanky accessory pick[^.]*\./g, ""],
  [/\s*Solid alt accessory[^.]*\./g, ""],
  // other meta
  [/\s*\(Was listed as[^)]+\)/g, ""],
  [/\s*\(per in-game;[^)]*\)/g, ""],
  [/\s*\(Shots \d+ vs a dummy\)\.?/g, ""],
  // artifact cleanup
  [/\.\s*\./g, "."],
  [/,\s*\./g, "."],
  [/\s+\./g, "."],
  [/ {2,}/g, " "],
];

// Apply fixes inside notes: "..." values only
html = html.replace(/notes: "([^"]*)"/g, function(match, note) {
  let cleaned = note;
  fixes.forEach(function([pat, rep]) {
    cleaned = cleaned.replace(pat, rep);
  });
  // trim trailing punctuation/spaces
  cleaned = cleaned.replace(/[,\s]+$/, "").trim();
  return 'notes: "' + cleaned + '"';
});

fs.writeFileSync(file, html, "utf8");
console.log("Done.");
