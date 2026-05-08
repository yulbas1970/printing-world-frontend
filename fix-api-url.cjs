const fs = require("fs");
const path = require("path");

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      walk(full);
    } else if (full.endsWith(".ts") || full.endsWith(".tsx")) {
      let text = fs.readFileSync(full, "utf8");

      text = text.replace(/'\$\{API_URL\}/g, "`${API_URL}");
      text = text.replace(/"\$\{API_URL\}/g, "`${API_URL}");
      text = text.replace(/`\$\{API_URL\}([^`'"]*)'/g, "`${API_URL}$1`");
      text = text.replace(/`\$\{API_URL\}([^`'"]*)"/g, "`${API_URL}$1`");

      text = text.replace(/'Bearer \$\{token\}'/g, "`Bearer ${token}`");
      text = text.replace(/"Bearer \$\{token\}"/g, "`Bearer ${token}`");

      fs.writeFileSync(full, text, "utf8");
    }
  }
}

walk("src");
console.log("Limpieza API_URL completada.");
