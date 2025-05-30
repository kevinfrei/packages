import { Cue } from '../index.js';
import { promises as fsp } from 'node:fs';
import { test, beforeAll, afterAll, expect } from 'bun:test';
import path from 'path';
import { TextFileToArray } from '@freik/files';

let prevCwd: string | null = null;

beforeAll(() => {
  prevCwd = process.cwd();
  if (!prevCwd.endsWith('media-utils')) {
    // If we are not in the media-utils module, we need to cd to it
    process.chdir(path.join('modules', 'server', 'media-utils'));
  }
});
afterAll(() => {
  if (prevCwd !== null) {
    process.chdir(prevCwd);
    prevCwd = null;
  }
});

async function cleanup() {
  {
    for (let i = 1; i < 6; i++) {
      try {
        await fsp.unlink(`src/__tests__/0${i} - Silence ${i}.flac`);
      } catch (e) {}
    }
  }
}

beforeAll(cleanup);
afterAll(cleanup);

test('Parse a CUE file', async () => {
  const filename = 'src/__tests__/test.cue';
  const cueContents = await TextFileToArray(filename);
  expect(cueContents).toBeDefined();
  const cueData = Cue.ParseFile(cueContents);
  expect(cueData).toBeDefined();
  // Make this better, yeah?
  const cueFile = await Cue.ToFlac(filename);
  expect(cueFile.success).toBe(5);
  expect(cueFile.failure).toBe(0);
});
