import { CueToFlac } from '../index.js';
import { promises as fsp } from 'node:fs';

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

it('Parse a CUE file', async () => {
  const filename = 'src/__tests__/test.cue';
  const cueFile = await CueToFlac(filename);
  expect(cueFile.success).toBe(5);
  expect(cueFile.failure).toBe(0);
});
