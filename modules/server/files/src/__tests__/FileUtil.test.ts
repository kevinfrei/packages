// import { exec } from 'node:child_process';
import fs from 'fs';
import {
  ArrayToTextFile,
  ArrayToTextFileSync,
  HideFile,
  FileSize,
  FileSizeSync,
  TextFileToArray,
  TextFileToArraySync,
} from '../FileUtil';
const { promises: fsp } = fs;
import { test, expect, beforeAll, afterAll } from 'bun:test';
import { $ } from 'bun';
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

// const { promisify } = require('util');

// module.exports.getGitUser = async function getGitUser() {
//   const name = 'Kevin Frei';
//   const email = 'kevinfrei@hotmail.com';
//   return { name, email };
// };

test('async array to text file and back again', async () => {
  const data = 'a b c d e f g';
  const fileName = 'textFile.txt';
  try {
    await fsp.unlink(fileName);
  } catch (e) {}
  await ArrayToTextFile(data.split(' '), fileName);
  const newData = await TextFileToArray(fileName);
  const result = newData.join(' ');
  try {
    await fsp.unlink(fileName);
  } catch (e) {}
  expect(data).toEqual(result);
});

test('array to text file and back again', () => {
  const data = 'a b c d e f g';
  const fileName = 'textFile.txt';
  try {
    fs.unlinkSync(fileName);
  } catch (e) {}
  ArrayToTextFileSync(data.split(' '), fileName);
  const newData = TextFileToArraySync(fileName);
  const result = newData.join(' ');
  try {
    fs.unlinkSync(fileName);
  } catch (e) {}
  expect(data).toEqual(result);
});

async function getNormalFiles(dir: string): Promise<string[]> {
  const files = await $`ls ${dir}`.text();
  return files.split('\n');
}

async function getAllFiles(dir: string): Promise<string[]> {
  const files = await fs.promises.readdir(dir);
  return files;
}

test('hiding a file on MacOS/Windows', async () => {
  const pathName = 'testFile.empty';
  if (process.platform === 'darwin') {
    try {
      await fsp.unlink(pathName);
    } catch (e) {}
    await ArrayToTextFile(['this', 'is', 'a', 'test'], pathName);
    const lsBefore = await $`/bin/ls -lO`.text();
    expect(lsBefore.indexOf(pathName)).toBeGreaterThanOrEqual(0);
    const newPath = await HideFile(pathName);
    expect(newPath).toEqual('.' + pathName);
    const lsAfter = await $`/bin/ls -lO`.text();
    expect(lsAfter.indexOf(pathName)).toBeLessThan(0);
    const lsHidden = await $`/bin/ls -laO`.text();
    const hidden = lsHidden.indexOf('hidden');
    const fileLoc = lsHidden.indexOf(pathName);
    expect(hidden).toBeLessThan(fileLoc);
    expect(hidden).toBeGreaterThan(-1);
    try {
      await fsp.unlink('.' + pathName);
      await fsp.unlink(pathName);
    } catch (e) {}
  } else if (process.platform === 'win32') {
    try {
      await fsp.unlink(pathName);
    } catch (e) {}
    await ArrayToTextFile(['this', 'is', 'a', 'test'], pathName);
    const lsBefore = await $`ls`.text();
    expect(lsBefore.indexOf(pathName)).toBeGreaterThanOrEqual(0);
    const newPath = await HideFile(pathName);
    expect(newPath).toEqual('.' + pathName);
    const lsAfter = await getNormalFiles('.');
    expect(lsAfter.includes(newPath)).toBeFalse();
    const lsHidden = await getAllFiles('.');
    const fileLoc = lsHidden.includes(newPath);
    expect(fileLoc).toBeTrue();
    try {
      await fsp.unlink('.' + pathName);
      await fsp.unlink(pathName);
    } catch (e) {}
  } else {
    console.log('hiding files NYI on Windows or Linux');
  }
});

test('Some more minor things', async () => {
  expect(FileSizeSync('src/__tests__/FileSizeTest/file1.txt')).toBe(1);
  expect(await FileSize('src/__tests__/FileSizeTest/file2.txt')).toBe(2);
  expect(FileSizeSync('src/__tests__/FileSizeTest/file1.nope')).toBe(-1);
  expect(await FileSize('src/__tests__/FileSizeTest/file2.nope')).toBe(-1);
});
