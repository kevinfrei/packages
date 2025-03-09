import { MakeStringWatcher, MakeSuffixWatcher } from '../index';
import { test, expect } from 'bun:test';

test('String File Type Watcher Ignore, then Watch testing', () => {
  const ftw = MakeStringWatcher();
  expect(ftw).toBeDefined();
  expect(ftw.watching('.txt')).toBe(true);
  expect(ftw.watching('.jpg')).toBe(true);
  expect(ftw.watching('.mp3')).toBe(true);
  ftw.addToIgnoreList('.txt');
  expect(ftw.watching('.txt')).toBe(false);
  expect(ftw.watching('.jpg')).toBe(true);
  expect(ftw.watching('.mp3')).toBe(true);
  ftw.addToWatchList('.mp3');
  expect(ftw.watching('.txt')).toBe(false);
  expect(ftw.watching('.jpg')).toBe(false);
  expect(ftw.watching('.mp3')).toBe(true);
});

test('Suffix File Type Watcher Ignore, then Watch testing', () => {
  const ftw = MakeSuffixWatcher();
  expect(ftw).toBeDefined();
  expect(ftw.watching('asdf.txt')).toBe(true);
  expect(ftw.watching('sdf.jpg')).toBe(true);
  expect(ftw.watching('sdf.mp3')).toBe(true);
  ftw.addToIgnoreList('.txt');
  expect(ftw.watching('asdf.txt')).toBe(false);
  expect(ftw.watching('asdf.jpg')).toBe(true);
  expect(ftw.watching('asdf.mp3')).toBe(true);
  ftw.addToWatchList('.mp3');
  expect(ftw.watching('asdf.txt')).toBe(false);
  expect(ftw.watching('asdf.jpg')).toBe(false);
  expect(ftw.watching('asdf.mp3.foo')).toBe(false);
  expect(ftw.watching('asdf.mp3')).toBe(true);
});

test('String File Type Watcher Watch, then Ignore testing', () => {
  const ftw = MakeStringWatcher();
  ftw.addToWatchList('.mp3');
  expect(ftw.watching('.txt')).toBe(false);
  expect(ftw.watching('.jpg')).toBe(false);
  expect(ftw.watching('.mp3')).toBe(true);
  expect(ftw.watching('more.mp3')).toBe(false);
  ftw.addToIgnoreList('.txt');
  expect(ftw.watching('.txt')).toBe(false);
  expect(ftw.watching('.jpg')).toBe(false);
  expect(ftw.watching('.mp3')).toBe(true);
});

test('Suffix File Type Watcher Watch, then Ignore testing', () => {
  const ftw = MakeSuffixWatcher();
  ftw.addToWatchList('.mp3');
  expect(ftw.watching('asdf.txt')).toBe(false);
  expect(ftw.watching('asdf.jpg')).toBe(false);
  expect(ftw.watching('asdf.mp3')).toBe(true);
  ftw.addToIgnoreList('.txt');
  expect(ftw.watching('asdf.txt')).toBe(false);
  expect(ftw.watching('asdf.jpg')).toBe(false);
  expect(ftw.watching('asdf.mp3')).toBe(true);
});

test('String File Type Watcher multiples testing', () => {
  const ftw = MakeStringWatcher();
  ftw.addToIgnoreList('.txt', '.jpg');
  expect(ftw.watching('.txt')).toBe(false);
  expect(ftw.watching('.jpg')).toBe(false);
  expect(ftw.watching('.mp3')).toBe(true);
  expect(ftw.watching('.mp4')).toBe(true);
  ftw.addToWatchList(['.flac', '.mp3']);
  expect(ftw.watching('.txt')).toBe(false);
  expect(ftw.watching('.jpg')).toBe(false);
  expect(ftw.watching('.mp3')).toBe(true);
  expect(ftw.watching('.mp4')).toBe(false);
  expect(ftw.watching('.flac')).toBe(true);
});

test('Suffix File Type Watcher multiples testing', () => {
  const ftw = MakeSuffixWatcher();
  ftw.addToIgnoreList('.txt', '.jpg');
  expect(ftw.watching('asdf.txt')).toBe(false);
  expect(ftw.watching('asdf.jpg')).toBe(false);
  expect(ftw.watching('sadf.mp3')).toBe(true);
  expect(ftw.watching('asdf.mp4')).toBe(true);
  ftw.addToWatchList(['.flac', '.mp3']);
  expect(ftw.watching('asdf.txt')).toBe(false);
  expect(ftw.watching('asdf.jpg')).toBe(false);
  expect(ftw.watching('sadf.mp3')).toBe(true);
  expect(ftw.watching('asdf.mp4')).toBe(false);
  expect(ftw.watching('asdf.flac')).toBe(true);
});

test('String File Type Watcher Chaining Ignore then Watch', () => {
  const ftw = MakeStringWatcher()
    .addToIgnoreList(['.txt', '.jpg'])
    .addToWatchList(new Set(['.mp3', '.flac']));
  expect(ftw.watching('.txt')).toBe(false);
  expect(ftw.watching('.jpg')).toBe(false);
  expect(ftw.watching('.mp3')).toBe(true);
  expect(ftw.watching('.mp4')).toBe(false);
  expect(ftw.watching('.flac')).toBe(true);
});

test('Suffix File Type Watcher Chaining Ignore then Watch', () => {
  const ftw = MakeSuffixWatcher()
    .addToIgnoreList(['.txt', '.jpg'])
    .addToWatchList(new Set(['.mp3', '.flac']));
  expect(ftw.watching('asdf.txt')).toBe(false);
  expect(ftw.watching('asdf.jpg')).toBe(false);
  expect(ftw.watching('asdf.mp3')).toBe(true);
  expect(ftw.watching('asdf.mp4')).toBe(false);
  expect(ftw.watching('asdf.flac')).toBe(true);
});

test('String File Type Watcher Chaining Watch then Ignore', () => {
  const ftw = MakeStringWatcher()
    .addToWatchList('.mp3', ['.flac'])
    .addToIgnoreList(['.txt'], '.jpg');
  expect(ftw.watching('.txt')).toBe(false);
  expect(ftw.watching('.jpg')).toBe(false);
  expect(ftw.watching('.mp3')).toBe(true);
  expect(ftw.watching('.mp4')).toBe(false);
  expect(ftw.watching('.flac')).toBe(true);
});

test('Suffix File Type Watcher Chaining Watch then Ignore', () => {
  const ftw = MakeSuffixWatcher()
    .addToWatchList('.mp3', ['.flac'])
    .addToIgnoreList(['.txt'], '.jpg');
  expect(ftw.watching('asdf.txt')).toBe(false);
  expect(ftw.watching('asdf.jpg')).toBe(false);
  expect(ftw.watching('asdf.mp3')).toBe(true);
  expect(ftw.watching('asdf.mp4')).toBe(false);
  expect(ftw.watching('asdf.flac')).toBe(true);
});

test('String File Type Watcher Chaining Watch then Ignore, with direct function call', () => {
  const ftw = MakeStringWatcher()
    .addToWatchList('.mp3', ['.flac'])
    .addToIgnoreList(['.txt'], '.jpg');
  expect(ftw('.txt')).toBe(false);
  expect(ftw('.jpg')).toBe(false);
  expect(ftw('.mp3')).toBe(true);
  expect(ftw('.flac')).toBe(true);
  expect(ftw('.mp4')).toBe(false);
});

test('Suffix File Type Watcher Chaining Watch then Ignore, with direct function call', () => {
  const ftw = MakeSuffixWatcher()
    .addToWatchList('.mp3', ['.flac'])
    .addToIgnoreList(['.txt'], '.jpg');
  expect(ftw('asdf.txt')).toBe(false);
  expect(ftw('asdf.jpg')).toBe(false);
  expect(ftw('asdf.mp3')).toBe(true);
  expect(ftw('sadf.flac')).toBe(true);
  expect(ftw('asdf.mp4')).toBe(false);
});
