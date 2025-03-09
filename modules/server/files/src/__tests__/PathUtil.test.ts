import os from 'os';
import {
  ChangeExt,
  DirName,
  GetExtNoDot,
  GetRoots,
  GetTemp,
  Join,
  Resolve,
  TrailingSlash,
  Xplat,
} from '../PathUtil';
import { test, expect } from 'bun:test';

test('temp file names', () => {
  const tmp = GetTemp('MyTempFile');
  const tmpSfx = GetTemp('ATempFile', 'sfx');
  expect(tmp.indexOf('MyTempFile')).toBeGreaterThan(2);
  expect(tmp.lastIndexOf('/')).toBeLessThan(tmp.indexOf('MyTempFile'));
  expect(tmpSfx.lastIndexOf('.sfx')).toBe(tmpSfx.length - 4);
});

test('File extension stuff', () => {
  const justExt = GetExtNoDot('A/File/name.txt');
  expect(justExt).toBe('txt');
  const another = GetExtNoDot('//a/file.nam/is.in.here');
  expect(another).toBe('here');
  const noExt = GetExtNoDot('theFol.der/FIleName');
  expect(noExt).toBe('');
  const newExt1 = ChangeExt('abc', 'def');
  expect(newExt1).toBe('abc.def');
  const newExt2 = ChangeExt(newExt1, '.jpg');
  expect(newExt2).toBe('abc.jpg');
  const newExt3 = ChangeExt('abc', '.jpg');
  expect(newExt3).toBe('abc.jpg');
  const lastExt = ChangeExt('abc.def', 'ghi');
  expect(lastExt).toBe('abc.ghi');
});

test('A few other operations', () => {
  expect(Xplat('/a/b')).toBe('/a/b');
  expect(Xplat('\\a\\b')).toBe('/a/b');
  expect(TrailingSlash('/a/b/c')).toBe('/a/b/c/');
  expect(TrailingSlash('\\a/b\\c')).toBe('/a/b/c/');
  expect(TrailingSlash('\\a\\b\\')).toBe('/a/b/');
  const prefix = os.platform() === 'win32' ? 'c:' : '';
  expect(Resolve('/a/../b/c/..').toLowerCase()).toBe(prefix + '/b');
  expect(Resolve('\\a\\.\\b\\c\\.').toLowerCase()).toBe(prefix + '/a/b/c');
  expect(Join('a', 'b')).toBe('a/b');
  expect(Join('a/b', 'c\\d')).toBe('a/b/c/d');
  expect(DirName('a/b')).toBe('a');
});

test('Roots', async () => {
  const roots = await GetRoots();
  switch (os.platform()) {
    case 'darwin':
      for (const r of roots) {
        expect(r.indexOf('/Volumes/')).toBe(0);
      }
      break;
    case 'win32':
      for (const r of roots) {
        expect(r.indexOf(':')).toBe(1);
      }
      break;
    default:
      // Test for linux!
      expect(false).toBeTruthy();
  }
});
