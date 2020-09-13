const fs = require('fs');
const path = require('path');
const exec = require('@ricokahler/exec');

const root = path.resolve(__dirname, '../');

async function createPackageJson() {
  const packageBuffer = await fs.promises.readFile(
    path.resolve(root, './package.json')
  );
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
    main: 'index.js',
    module: 'index.esm.js',
    sideEffects: false,
  };

  await fs.promises.writeFile(
    path.resolve(root, './dist/package.json'),
    JSON.stringify(minimalPackage, null, 2)
  );
}

async function build() {
  console.log('Cleaning…');
  await exec('rm -rf node_modules dist');
  await exec('npm i');
  await exec('mkdir dist');

  console.log('Copying types…');
  await exec('cp index.d.ts ./dist');

  console.log('Compiling…');
  await exec('npx rollup -c');

  console.log('Writing package.json…');
  await createPackageJson();

  console.log('Copying README.md…');
  const readme = await fs.promises.readFile(path.resolve(root, './README.md'));
  await fs.promises.writeFile(path.resolve(root, './dist/README.md'), readme);

  console.log('Done building!');
}

build()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
