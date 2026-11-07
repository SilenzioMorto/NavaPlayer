// writes renderer/version.json from package.json (read by the splash screen)
const fs = require('fs'), path = require('path');
const pkg = require('../package.json');
fs.writeFileSync(path.join(__dirname, '..', 'renderer', 'version.json'), JSON.stringify({ version: pkg.version, channel: 'beta' }));
console.log('version', pkg.version);
