const fs = require('fs');
const paths = ['package.json', 'backend/package.json', 'frontend/package.json', 'desktop/package.json', 'cloud-backend/package.json'];
paths.forEach(p => {
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/"version": "1.1.3"/g, '"version": "1.1.4"');
    fs.writeFileSync(p, c);
    console.log('Updated ' + p);
  }
});
