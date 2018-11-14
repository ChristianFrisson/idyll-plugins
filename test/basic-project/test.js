jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000; // 30 second timeout

const Idyll = require('idyll');
const fs = require('fs');
const { join, resolve, dirname } = require('path');
const rimraf = require('rimraf');

const getFilenames = (dir) => {
  return fs.readdirSync(dir).filter(f => f !== '.DS_Store');
}

const dirToHash = (dir) => {
  return getFilenames(dir).reduce(
    (acc, val) => {
      let fullPath = join(dir, val);

      if (fs.statSync(fullPath).isFile()) {
        acc[val] = fs.readFileSync(fullPath, 'utf8');
      } else {
        acc[val] = dirToHash(fullPath);
      }

      return acc;
    },
    {}
  );
}

const PROJECT_DIR = join(__dirname, 'src');

const PROJECT_BUILD_DIR = join(PROJECT_DIR, 'build');
const PROJECT_IDYLL_CACHE = join(PROJECT_DIR, '.idyll');
let projectBuildFilenames;
let projectBuildResults;

const EXPECTED_DIR = join(__dirname, 'expected-output');
// build output to test against
const EXPECTED_BUILD_DIR = join(EXPECTED_DIR, 'build');
const EXPECTED_BUILD_FILENAMES = getFilenames(EXPECTED_BUILD_DIR);
const EXPECTED_BUILD_RESULTS = dirToHash(EXPECTED_BUILD_DIR);

beforeAll(() => {
  rimraf.sync(PROJECT_BUILD_DIR);
  rimraf.sync(PROJECT_IDYLL_CACHE);
})

let output;
let idyll;

beforeAll(done => {
  idyll = Idyll({
    inputFile: join(PROJECT_DIR, 'index.idyll'),
    output: PROJECT_BUILD_DIR,
    htmlTemplate: join(PROJECT_DIR, '_index.html'),
    components: join(PROJECT_DIR, 'components'),
    datasets: join(PROJECT_DIR, 'data'),
    layout: 'centered',
    compiler: {
      postProcessors: [
          "idyll-plugin-table-of-contents"
        ]
    },
    minify: false
  });

  idyll.on('update', (o) => {
    output = o;
    projectBuildFilenames = getFilenames(PROJECT_BUILD_DIR);
    projectBuildResults = dirToHash(PROJECT_BUILD_DIR);
    done();
  }).build();
})

test('creates the expected files', () => {
  expect(projectBuildFilenames).toEqual(EXPECTED_BUILD_FILENAMES);
})

test('creates the expected HTML', () => {
  expect(projectBuildResults['index.html']).toEqual(EXPECTED_BUILD_RESULTS['index.html']);
});
