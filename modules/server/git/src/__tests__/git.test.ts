import {
  isArray,
  isArrayOfString,
  isMapOf,
  isString,
  isUndefined,
} from '@freik/typechk';
import { Git } from '../index';
import { test, expect, beforeAll, afterAll } from 'bun:test';
import path from 'path';

let prevCwd: string | null = null;

beforeAll(() => {
  prevCwd = process.cwd();
  if (!prevCwd.endsWith('git')) {
    // If we are not in the data-store module, we need to cd to it
    process.chdir(path.join('modules', 'server', 'git'));
  }
});
afterAll(() => {
  if (prevCwd !== null) {
    process.chdir(prevCwd);
    prevCwd = null;
  }
});

test('Simple git.files tests', async () => {
  const files = await Git.files({ filter: 'all' });
  expect(isArray(files)).toBeTruthy();
  expect(files.length).toBeGreaterThan(5);
  expect(files.length).toBeLessThan(50);

  const noFiles = await Git.files();
  // This will fail if we have any edits :/
  // expect(Type.isArray(noFiles)).toBeTruthy();
  // This will fail if we have *all* files edited...
  // console.log(files);
  // console.log(noFiles);
  expect(noFiles.length).toBeLessThanOrEqual(files.length);
});

test('Grouped git.files tests', async () => {
  const files = await Git.files({
    filter: 'all',
    groups: {
      prettier: (filename: string) => {
        if (filename === '.prettierrc') {
          return true;
        }
        return /\.(ts|tsx|js|jsx|md|html|css|json)$/i.test(filename);
      },
      clang: /\.(cpp|c|cc|h|hh|hpp)$/i,
      other: (_fn) => false,
    },
  });
  expect(isMapOf(files.groups, isString, isArrayOfString)).toBeTruthy();
  expect(files.remaining.length).toBeGreaterThan(2);
  const grps = files.groups;
  expect(grps.size).toEqual(1);
  expect(grps.get('clang')).toBeUndefined();
  expect(grps.get('other')).toBeUndefined();
  const p = grps.get('prettier');
  if (isUndefined(p)) {
    expect('prettier not defined').toEqual('oops');
    throw 'oops';
  }
  expect(p.length).toBeGreaterThan(5);
});
