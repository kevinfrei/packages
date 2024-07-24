// import { exec } from 'node:child_process';
import fs from 'fs';
import {
  arrayToTextFile,
  arrayToTextFileAsync,
  hideFile,
  size,
  sizeAsync,
  textFileToArray,
  textFileToArrayAsync,
} from '../FileUtil';
const { promises: fsp } = fs;
import { test, expect } from 'bun:test';
import { $ } from 'bun';

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
  await arrayToTextFileAsync(data.split(' '), fileName);
  const newData = await textFileToArrayAsync(fileName);
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
  arrayToTextFile(data.split(' '), fileName);
  const newData = textFileToArray(fileName);
  const result = newData.join(' ');
  try {
    fs.unlinkSync(fileName);
  } catch (e) {}
  expect(data).toEqual(result);
});

test('hiding a file on MacOS/Windows', async () => {
  const pathName = 'testFile.empty';
  if (process.platform === 'darwin') {
    try {
      await fsp.unlink(pathName);
    } catch (e) {}
    await arrayToTextFileAsync(['this', 'is', 'a', 'test'], pathName);
    const lsBefore = await $`/bin/ls -lO`;
    expect(lsBefore.stdout.indexOf(pathName)).toBeGreaterThanOrEqual(0);
    const newPath = await hideFile(pathName);
    expect(newPath).toEqual('.' + pathName);
    const lsAfter = await $`/bin/ls -lO`;
    expect(lsAfter.stdout.indexOf(pathName)).toBeLessThan(0);
    const lsHidden = await $`/bin/ls -laO`;
    const hidden = lsHidden.stdout.indexOf('hidden');
    const fileLoc = lsHidden.stdout.indexOf(pathName);
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
    await arrayToTextFileAsync(['this', 'is', 'a', 'test'], pathName);
    const lsBefore = await $`ls`.text();
    expect(lsBefore.indexOf(pathName)).toBeGreaterThanOrEqual(0);
    const newPath = await hideFile(pathName);
    expect(newPath).toEqual('.' + pathName);
    const lsAfter = await $`ls`.text();
    expect(lsAfter.indexOf(pathName)).toBeLessThan(0);
    const lsHidden = await $`ls -A`.text();
    const fileLoc = lsHidden.indexOf(pathName);
    expect(fileLoc).toBeGreaterThan(-1);
    try {
      await fsp.unlink('.' + pathName);
      await fsp.unlink(pathName);
    } catch (e) {}
  } else {
    console.log('hiding files NYI on Windows or Linux');
  }
});

test('Some more minor things', async () => {
  expect(size('src/__tests__/FileIndexTest/file1.txt')).toBe(1);
  expect(await sizeAsync('src/__tests__/FileIndexTest/file2.txt')).toBe(1);
  expect(size('src/__tests__/FileIndexTest/file1.nope')).toBe(-1);
  expect(await sizeAsync('src/__tests__/FileIndexTest/file2.nope')).toBe(-1);
});
