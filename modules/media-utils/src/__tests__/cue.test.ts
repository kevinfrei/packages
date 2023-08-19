import { CueToFlac } from '../index.js';

it('Parse a CUE file', async () => {
  const filename = 'src/__tests__/test.cue';
  const cueFile = await CueToFlac(filename);
});
