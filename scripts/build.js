/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const root = path.resolve(__dirname, '../');

const args = process.argv.slice(2);

function execute(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      console.log(stdout);
      console.error(stderr);

      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function createPackageJson() {
  const packageBuffer = await readFile(path.resolve(root, './package.json'));
  const packageJson = JSON.parse(packageBuffer.toString());

  const minimalPackage = {
    author: packageJson.author,
    version: packageJson.version,
    description: packageJson.description,
    keywords: packageJson.keywords,
    repository: packageJson.repository,
    license: packageJson.license,
    bugs: packageJson.bugs,
    homepage: packageJson.homepage,
    peerDependencies: packageJson.peerDependencies,
    dependencies: packageJson.dependencies,
    name: 'hocify',
    main: packageJson.main,
  };

  await writeFile(
    path.resolve(root, './build/package.json'),
    JSON.stringify(minimalPackage, null, 2),
  );
}

async function build() {
  if (!args.includes('--no-clean')) {
    console.log('Cleaning…');
    await execute('rm -rf node_modules build && npm i');
  }

  console.log('Copying typings (rsync)…');
  await execute('rsync -r --include "*.d.ts" --include "*/" --exclude="*" --quiet ./src/* ./build');

  console.log('Checking Types (tsc)…');
  await execute('npx tsc');

  console.log('Compiling (webpack)…');
  await execute('npx webpack -p');

  console.log('Writing package.json…');
  await createPackageJson();

  console.log('Done building!');
}

build()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
