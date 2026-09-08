const { loadConfigFromFile } = require('vite');
const path = require('path');
(async () => {
  process.env.VERCEL = '1';
  const config = await loadConfigFromFile({ command: 'build', mode: 'production' }, path.resolve('./frontend/vite.config.ts'));
  console.log(config.config.base);
})();
