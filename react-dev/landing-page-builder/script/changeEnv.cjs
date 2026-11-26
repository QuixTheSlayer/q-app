const fs = require("fs");
const path = require("path");


function overwriteFile(filePath, content = "") {
    const fullPath = path.resolve(filePath);
    fs.writeFileSync(fullPath, content, "utf8");
    console.log(`✓ Created: ${filePath}`);
}

overwriteFile('src/libs/checkEnv.ts','export const isDev = false')