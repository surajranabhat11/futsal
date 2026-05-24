const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('e:/Broadway/FYP/Futsal_demo/app/api').filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
let replaced = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('../auth/[...nextauth]/route')) {
    content = content.replace(/import\s+\{\s*authOptions\s*\}\s+from\s+[\"'](\.\.\/)*auth\/\[\.\.\.nextauth\]\/route[\"']/g, 'import { authOptions } from "@/lib/auth"');
    fs.writeFileSync(f, content);
    replaced++;
  }
});

console.log('Replaced in ' + replaced + ' files');
