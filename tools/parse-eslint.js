const fs = require("fs");
const p = "eslint-report.json";
if (!fs.existsSync(p)) {
  console.error("eslint report not found");
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(p, "utf8"));
const out = [];
for (const f of data) {
  if (f.messages && f.messages.length) {
    for (const m of f.messages) {
      out.push(
        `${f.filePath}:${m.line || 0}:${m.column || 0} ${m.ruleId || "unknown"} ${m.message}`,
      );
    }
  }
}
require("fs").writeFileSync("eslint-warnings-utf8.txt", out.join("\n"), "utf8");
console.log("wrote eslint-warnings-utf8.txt");
