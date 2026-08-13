const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, callback);
    else callback(p);
  });
}

const frontendSrc = path.join(process.cwd(), 'frontend/src');
walk(frontendSrc, (file) => {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Replace the regex image hack
    const searchString = ".replace(/^https?:\\/\\/[^/]+(\\/uploads\\/)/, '$1')";
    if (content.includes(searchString)) {
      if (!content.includes('getImageUrl')) {
        content = "import { getImageUrl } from '@/utils/image';\n" + content;
      }
      // Fix instances like (product.image_url || product.imageUrl)?.replace(...)
      content = content.replace(/\(([^)]+)\)\?\.replace\(\/\^https\?:\/\/\.\*\//g, 'getImageUrl($1)'); 
      // Because regex replace is hard to match exactly, we can use string replace all
      content = content.split(searchString).join('');
      // Now we need to wrap the variable in getImageUrl... Wait, simple string replacement is safer.
      // E.g. `src={(product.image_url || product.imageUrl)?.replace(/^https?:\/\/[^/]+(\/uploads\/)/, '$1')}`
      // we want `src={getImageUrl(product.image_url || product.imageUrl)}`
    }
  }
});
