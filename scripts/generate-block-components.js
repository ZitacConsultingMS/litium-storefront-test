const fs = require('fs');
if (!fs.existsSync('./possibleTypes.json')) {
  throw 'possibleTypes.json file not found. Please execute `yarn run generate-possible-types` to generate the file.';
}

const possibleTypes = require('../possibleTypes.json');
const blockTypes = possibleTypes.IBlock;
const { service, component } = require('./blocks.template');

function writeFileErrorHandler(err) {
  if (err) throw err;
}
fs.writeFile(
  './services/blockService.server.ts',
  service(blockTypes),
  writeFileErrorHandler
);
blockTypes.forEach((type) => {
  const path = `./components/blocks/${type}.tsx`;
  if (!fs.existsSync(path)) {
    fs.writeFile(path, component(type), writeFileErrorHandler);
  }
});
