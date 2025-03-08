import os from 'os';
import { Spawn, SpawnResSync, SpawnRes } from '../Spawn';
import { test, expect, setDefaultTimeout } from 'bun:test';

setDefaultTimeout(15000);

const isWin = os.platform() === 'win32';
const app = isWin ? 'taskkill.exe' : 'clang';

test('spawnAsync test 1', async () => {
  const res = await Spawn('git', ['status']);
  expect(res.stdout.indexOf('On branch ')).toBe(0);
});
test('spawnAsync test 2', async () => {
  const badRes = await Spawn(app, ['shit']);
  //  console.log(badRes);
  expect(badRes.status).toBe(1);
  if (isWin) {
    expect(badRes.stderr.indexOf('Invalid argument')).toBeGreaterThanOrEqual(0);
  } else {
    expect(badRes.stderr.indexOf('error')).toBeGreaterThanOrEqual(0);
  }
});
test('spawnAsync test 3', async () => {
  const res2 = await Spawn(app);
  expect(res2.status).toBe(1);
  expect(res2.stderr.indexOf('clang error: no input files')).toBe(-1);
  //  expect(res2.stderr.length).toBeGreaterThan(0);
});
test('spawnAsync test 4', async () => {
  const res3 = await SpawnRes('git', ['status']);
  expect(res3).toBeTruthy();
});
test('more spawn async tests', async () => {
  try {
    const res4 = await SpawnRes(app, undefined, { env: { a: 'b' } });
    expect(res4).toBeFalsy();
  } catch (e) {
    console.log(e);
  }
  const badRe2 = await SpawnRes(app, ['shit']);
  expect(badRe2).toBeFalsy();
});

test('spawnRes test 1', () => {
  const res = SpawnResSync('git', ['status']);
  expect(res).toBeTruthy();
});
test('spawnRes test 12', () => {
  const res2 = SpawnResSync('git', undefined, { timeout: 1 });
  expect(res2).toBeFalsy();
});
test('spawnRes test 3', () => {
  const badRes = SpawnResSync('bun', ['shit']);
  //  console.log(badRes);
  expect(badRes).toBeFalsy();
});
