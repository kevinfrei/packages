import { ForDirs, ForFiles, ForFilesSync } from '../forFiles';
import { test, expect, beforeAll, afterAll } from 'bun:test';
import path from 'path';

let prevCwd: string | null = null;

beforeAll(() => {
  prevCwd = process.cwd();
  if (!prevCwd.endsWith('files')) {
    // If we are not in the files module, we need to cd to it
    process.chdir(path.join('modules', 'server', 'files'));
  }
});
afterAll(() => {
  if (prevCwd !== null) {
    process.chdir(prevCwd);
    prevCwd = null;
  }
});

test('Very Basic', () => {
  const seen = Array<number>(7).fill(0);
  let count = 0;
  ForFilesSync(
    'src/__tests__/SubdirTest',
    (filename) => {
      count++;
      const dot = filename.lastIndexOf('.');
      expect(dot).toBe(filename.length - 4);
      const val = Number.parseInt(filename[dot - 1]);
      seen[val - 1]++;
      return true;
    },
    { recurse: true },
  );
  expect(count).toBe(7);
  ForFilesSync(
    'src/__tests__/SubdirTest/subdir3',
    (filename) => {
      count++;
      const dot = filename.lastIndexOf('.');
      expect(dot).toBe(filename.length - 4);
      const val = Number.parseInt(filename[dot - 1]);
      seen[val - 1]++;
      return true;
    },
    { recurse: false },
  );
  expect(count).toBe(9);
  expect(seen).toEqual([1, 1, 1, 1, 2, 2, 1]);
});

test('Some file type filter', () => {
  let count = 0;
  ForFilesSync(
    'src/__tests__/SubdirTest/subdir2',
    (filename) => {
      count++;
      const dot = filename.lastIndexOf('.');
      expect(dot).toBe(filename.length - 4);
      return true;
    },
    { fileTypes: ['txt'] },
  );
  expect(count).toBe(3);
});

test('Very Basic Async', async () => {
  const seen = Array<number>(7).fill(0);
  let count = 0;
  await ForFiles(
    'src/__tests__/SubdirTest',
    (filename) => {
      count++;
      const dot = filename.lastIndexOf('.');
      expect(dot).toBe(filename.length - 4);
      const val = Number.parseInt(filename[dot - 1]);
      seen[val - 1]++;
      return true;
    },
    { recurse: true },
  );
  expect(count).toBe(7);
  await ForFiles(
    'src/__tests__/SubdirTest/subdir3',
    async (filename) => {
      count++;
      const dot = filename.lastIndexOf('.');
      expect(dot).toBe(filename.length - 4);
      const val = Number.parseInt(filename[dot - 1]);
      seen[val - 1]++;
      return true;
    },
    { recurse: true },
  );
  expect(count).toBe(9);
  expect(seen).toEqual([1, 1, 1, 1, 2, 2, 1]);
});

test('Conditional recursion Async', async () => {
  const seen = Array<number>(7).fill(0);
  let count = 0;
  await ForFiles(
    'src/__tests__/SubdirTest',
    (filename) => {
      count++;
      const dot = filename.lastIndexOf('.');
      expect(dot).toBe(filename.length - 4);
      const val = Number.parseInt(filename[dot - 1]);
      seen[val - 1]++;
      return true;
    },
    { recurse: (dirName: string) => dirName.indexOf('3') < 0 },
  );
  expect(count).toBe(5);
  await ForFiles(
    'src/__tests__/SubdirTest',
    async (filename) => {
      count++;
      const dot = filename.lastIndexOf('.');
      expect(dot).toBe(filename.length - 4);
      const val = Number.parseInt(filename[dot - 1]);
      seen[val - 1]++;
      return Promise.resolve(true);
    },
    { recurse: (dirName: string) => dirName.indexOf('3') >= 0 },
  );
  expect(count).toBe(7);
  expect(seen).toEqual([1, 1, 1, 1, 1, 1, 1]);
});

test('Some file type filter async', async () => {
  let count = 0;
  await ForFiles(
    'src/__tests__/SubdirTest/subdir2',
    (filename) => {
      count++;
      const dot = filename.lastIndexOf('.');
      expect(dot).toBe(filename.length - 4);
      return true;
    },
    { fileTypes: ['txt'] },
  );
  expect(count).toBe(3);
});

test('Basic ForDirs test', async () => {
  let count = 0;
  const adder = (dirname: string) => {
    count++;
    return true;
  };
  // Recursion
  await ForDirs('src/__tests__/SubdirTest', adder, { recurse: true });
  expect(count).toBe(4);
  count = 0;
  // No recursion
  await ForDirs('src/__tests__/SubdirTest', adder, { recurse: false });
  expect(count).toBe(3);
  count = 0;
  // Filtering
  await ForDirs(
    'src/__tests__/SubdirTest',
    (dirname) => {
      count++;
      return !dirname.endsWith('subdir2');
    },
    { recurse: true, keepGoing: true },
  );
  expect(count).toBe(3);
});

test('Skipping hidden file tests', async () => {
  let ei = 0;
  let bt = 0;
  let pack = 0;
  // Filtering
  const counter = (filename: string): boolean => {
    switch (filename) {
      case '.hidden-for-tests.txt':
        ei++;
        break;
      case 'bunfig.toml':
        bt++;
        break;
      case 'package.json':
        pack++;
        break;
    }
    return true;
  };
  await ForFiles('.', counter, {
    recurse: false,
    keepGoing: true,
    skipHiddenFiles: false,
    dontAssumeDotsAreHidden: true,
  });
  expect(ei).toEqual(1);
  expect(bt).toEqual(1);
  expect(pack).toEqual(1);
  await ForFiles('.', counter, {
    recurse: false,
    keepGoing: true,
    skipHiddenFiles: true,
    dontAssumeDotsAreHidden: true,
  });
  expect(ei).toEqual(1);
  expect(bt).toEqual(2);
  expect(pack).toEqual(2);
});
test('Stragglers', async () => {
  let jsonCount = 0;
  await ForFiles(
    '.',
    () => {
      jsonCount++;
      return true;
    },
    { fileTypes: 'json', recurse: false },
  );
  expect(jsonCount).toEqual(5);
  jsonCount = 0;
  ForFilesSync(
    '.',
    () => {
      jsonCount++;
      return true;
    },
    { fileTypes: 'json', recurse: false },
  );
  expect(jsonCount).toEqual(5);
  jsonCount = 0;
  await ForFiles(
    '.',
    () => {
      jsonCount++;
      return true;
    },
    { fileTypes: ['gif'], recurse: false },
  );
  expect(jsonCount).toEqual(0);
  jsonCount = 0;
  ForFilesSync(
    '.',
    () => {
      jsonCount++;
      return true;
    },
    { fileTypes: ['gif'], recurse: false },
  );
  expect(jsonCount).toEqual(0);
});
