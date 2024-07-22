import { expect, test } from 'bun:test';
import {
  FromB64,
  FromPathSafeName,
  FromU8,
  ToB64,
  ToPathSafeName,
  ToU8,
} from '../index';

test('Simplistic name encoding', () => {
  expect(ToPathSafeName('TEST')).toBe('TEST');
  expect(FromPathSafeName('TEST')).toBe('TEST');
});

test('Simple name round-tripping', () => {
  expect(FromPathSafeName(ToPathSafeName('TesT'))).toBe('TesT');
});

function allSafe(str: string): boolean {
  return /^[A-Z0-9_.-]*$/.exec(str) !== null;
}

test('Slightly complex round-tripping with basic validation', () => {
  const messyNames: string[] = [
    'c:/Tester.thing',
    `\\Volume\d$`,
    '/Users/data',
    '*?: __',
    '',
  ];
  for (const name of messyNames) {
    const safe = ToPathSafeName(name);
    expect(allSafe(safe)).toBeTruthy();
    expect(FromPathSafeName(safe)).toBe(name);
  }
});

test('Truly messy stuff round-tripping with basic validation', () => {
  const messyNames: string[] = [
    'ƒœ∂ƒ∆˚ƒø',
    "'øπˆ¨¥",
    '测试',
    'Yeş',
    'Ğğ',
    'ギ囲ダヾ',
    '한국어 키보드',
    'И цаньт wрите ин цыриллиц',
    'من فارسی صحبت نمی کنم',
    'बहुत से अन्य लोग शायद इसे पढ़ सकते हैं। पर मैं नहीं।',
    'אני לא מדבר שום עברית. אני גם לא מדבר יידיש.',
  ];
  for (const name of messyNames) {
    const safe = ToPathSafeName(name);
    expect(allSafe(safe)).toBeTruthy();
    expect(FromPathSafeName(safe)).toBe(name);
  }
});

test('Some U8 roundtripping with simple checks', () => {
  for (const value of [
    0,
    255,
    1234,
    16384,
    16384 * 8192,
    4294967294,
    4294967295,
    Number.MAX_SAFE_INTEGER,
    Math.floor(Number.MAX_SAFE_INTEGER / 15),
    4294967291 * 97, // Cus prime products are fun
  ]) {
    const after = ToU8(value);
    const before = FromU8(after);
    expect(after.length).toBeGreaterThan(0);
    let digitCount = 1;
    let rem = value;
    while (rem > 511) {
      digitCount++;
      rem = Math.floor(rem / 512);
    }
    expect(after.length).toEqual(digitCount);
    expect(before).toEqual(value);
  }
});

test('Some B64 roundtripping with simple checks', () => {
  const v1 = [22, 23, 24, 25, 26, 27, 28, 29];
  const v2 = [43, 47, 48, 49, 50, 51, 52, 53, 54, 61, 62, 63, 64, 65];
  const v3 = [0, 255, 1234, 16384, 16384 * 8192, 4294967294, 4294967295];
  for (const value of [
    ...v1,
    ...v2,
    ...v3,
    Number.MAX_SAFE_INTEGER,
    Math.floor(Number.MAX_SAFE_INTEGER / 15),
    4294967291 * 97, // Cus prime products are fun
  ]) {
    const after = ToB64(value);
    const before = FromB64(after);
    expect(after.length).toBeGreaterThan(0);
    let digitCount = 1;
    let rem = value;
    while (rem > 63) {
      digitCount++;
      rem = Math.floor(rem / 64);
    }
    expect(after.length).toEqual(digitCount);
    expect(before).toEqual(value);
  }
});
