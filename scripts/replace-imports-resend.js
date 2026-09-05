const fs = require("fs").promises;
const path = require("path");

async function walk(dir) {
  const entries = await fs.readdir(dir, {withFileTypes: true});
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", "dist"].includes(entry.name)) continue;
      await walk(full);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      let content = await fs.readFile(full, "utf8");
      const orig = content;
      content = content.replace(
        /@\/components\/newsletter/g,
        "@/components/resend-newsletter",
      );
      content = content.replace(/@\/lib\/newsletter/g, "@/lib/resend");
      content = content.replace(
        /@\/emails\/newsletter-2026/g,
        "@/emails/resend-newsletter",
      );
      content = content.replace(
        /@\/lib\/resend(?=\W|\/|$)/g,
        "@/lib/resend/resend",
      );
      content = content.replace(
        /@\/lib\/resendClient(?=\W|\/|$)/g,
        "@/lib/resend/resendClient",
      );
      content = content.replace(
        /@\/lib\/resendTypes(?=\W|\/|$)/g,
        "@/lib/resend/resendTypes",
      );
      // fix accidental double-resend-newsletter path introduced by earlier replacements
      content = content.replace(
        /resend-newsletter\/resend-newsletter/g,
        "resend-newsletter",
      );
      if (content !== orig) {
        await fs.writeFile(full, content, "utf8");
        console.log("updated", full);
      }
    }
  }
}

walk(path.join(__dirname, "..", "src")).catch((err) => {
  console.error(err);
  process.exit(1);
});
