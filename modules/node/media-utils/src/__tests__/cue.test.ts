import { Cue } from '../index.js';
import { promises as fsp } from 'node:fs';
import { FileUtil } from '@freik/node-utils';
import { test, beforeAll, afterAll ,expect } from 'bun:test';

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
  const cueContents = await FileUtil.textFileToArray(filename);
  expect(cueContents).toBeDefined();
  const cueData = Cue.ParseFile(cueContents);
  expect(cueData).toBeDefined();
  // Make this better, yeah?
  const cueFile = await Cue.ToFlac(filename);
  expect(cueFile.success).toBe(5);
  expect(cueFile.failure).toBe(0);
});
