import { Covers } from '../index.js';
import { test, expect } from 'bun:test';

const log = false ? console.log : (a: unknown) => {};

test('Read a jpeg from an mp3 file', async () => {
  const filename = 'src/__tests__/jpg.mp3';
  const mimeData = await Covers.ReadFromFile(filename);
  expect(mimeData).toBeDefined();
  if (mimeData) {
    expect(mimeData.type).toBe('image/jpeg');
    expect(mimeData.data.length).toBe(21032);
  }
});
/*
test('Read a jpeg from a flac file', async () => {
  const filename = 'src/__tests__/jpg.flac';
  const mimeData = await Covers.ReadFromFile(filename);
  expect(mimeData).toBeDefined();
  if (mimeData) {
    expect(mimeData.type).toBe('image/jpeg');
    expect(mimeData.data.length).toBe(21032);
  }
});
*/
test('Read a jpeg from an m4a file', async () => {
  const filename = 'src/__tests__/jpg.m4a';
  const mimeData = await Covers.ReadFromFile(filename);
  expect(mimeData).toBeDefined();
  if (mimeData) {
    expect(mimeData.type).toBe('image/jpeg');
    expect(mimeData.data.length).toBe(21032);
  }
});
test('Read a png from an mp3 file', async () => {
  const filename = 'src/__tests__/png.mp3';
  const mimeData = await Covers.ReadFromFile(filename);
  expect(mimeData).toBeDefined();
  if (mimeData) {
    expect(mimeData.type).toBe('image/png');
    expect(mimeData.data.length).toBe(17068);
  }
});
/*
test('Read a png from a flac file', async () => {
  const filename = 'src/__tests__/png.flac';
  const mimeData = await Covers.ReadFromFile(filename);
  expect(mimeData).toBeDefined();
  if (mimeData) {
    expect(mimeData.type).toBe('image/png');
    expect(mimeData.data.length).toBe(17068);
  }
});
*/
test('Read a png from an m4a file', async () => {
  const filename = 'src/__tests__/png.m4a';
  const mimeData = await Covers.ReadFromFile(filename);
  expect(mimeData).toBeDefined();
  if (mimeData) {
    expect(mimeData.type).toBe('image/png');
    expect(mimeData.data.length).toBe(17068);
  }
});
