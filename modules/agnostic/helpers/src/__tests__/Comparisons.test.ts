import { expect, test } from 'bun:test';
import {
  ArrayEqual,
  ArraySetEqual,
  MapEqual,
  ObjEqual,
  SetEqual,
  SetValEqual,
  StringCaseInsensitiveEqual,
  ValEqual,
} from '../Comparisons';
import {
  ArrayIntersection,
  ObjToMap,
  SetDifference,
  SetIntersection,
} from '../Operations';

test('Comparisons String Case Insensitive Equality', () => {
  expect(StringCaseInsensitiveEqual('a', 'A')).toBeTruthy();
  expect(StringCaseInsensitiveEqual('BBb', 'Bbba')).toBeFalsy();
  expect(StringCaseInsensitiveEqual()).toBeTruthy();
  expect(StringCaseInsensitiveEqual(undefined, '')).toBeFalsy();
  expect(StringCaseInsensitiveEqual(undefined, undefined)).toBeTruthy();
  expect(StringCaseInsensitiveEqual('', undefined)).toBeFalsy();
  expect(StringCaseInsensitiveEqual('')).toBeFalsy();
  expect(StringCaseInsensitiveEqual('', '')).toBeTruthy();
  expect(StringCaseInsensitiveEqual(undefined, 'a')).toBeFalsy();
  expect(StringCaseInsensitiveEqual('undefined', '')).toBeFalsy();
});

test('Set/Array operations', () => {
  const a1 = ['a', 'b', 'c'];
  const a2 = ['a', 'b', 'd', 'e'];
  const a3 = ['a', 'b', 'e'];
  const s1 = new Set<string>(a1);
  const s2 = new Set<string>(a2);
  expect(SetEqual(s1, s1)).toBeTruthy();
  expect(SetEqual(s1, s2)).toBeFalsy();
  expect(SetEqual(s2, s1)).toBeFalsy();
  const s1is2 = SetIntersection(s1, s2);
  const a1ia2 = ArrayIntersection(a1, a2);
  const a2ia1 = ArrayIntersection(a2, a1);
  expect(s1is2.size).toEqual(2);
  expect(s1is2).toEqual(a1ia2);
  expect(ArraySetEqual([...a1ia2], [...a2ia1])).toBeTruthy();
  const s3 = new Set(a1ia2);
  const s4 = new Set(a2ia1);
  expect(SetValEqual(s3, s4)).toBeTruthy();
  expect(SetValEqual(s4, s3)).toBeTruthy();
  s3.delete('a');
  expect(SetValEqual(s3, s4)).toBeFalsy();
  expect(ArraySetEqual(a1, a2)).toBeFalsy();
  expect(ArraySetEqual(a1, a3)).toBeFalsy();
  const s1ms2 = SetDifference(s1, s2);
  expect(s1ms2.size).toEqual(1);
  const s2ms1 = SetDifference(s2, s1);
  expect(s2ms1.size).toEqual(2);
  expect(SetIntersection(s1ms2, s2ms1).size).toEqual(0);
  expect(ArrayEqual(a1, a2)).toBeFalsy();
  expect(ArrayEqual(['a', 'b', 'd', 'e'], a2)).toBeTruthy();
});

test('Object to Map', () => {
  const obj1 = { a: 'b', c: 'd', e: 1 };
  const map1 = new Map<string, string>([
    ['a', 'b'],
    ['c', 'd'],
    ['e', '1'],
  ]);
  expect(ObjToMap(obj1)).toEqual(map1);
});

test('A few extras', () => {
  const obj1 = { a: 1, b: 2 };
  const obj2 = { a: 1 };
  const arr1 = [1, 2];
  const arr2 = [2, 3];
  const objS1 = { a: 1, [Symbol.iterator]: 2 };
  const objS2 = { [Symbol.iterator]: 2, a: 1 };
  const objS3 = { a: 1, [Symbol.iterator]: 1 };
  expect(ObjEqual(obj1, obj2)).toBeFalsy();
  expect(ObjEqual(objS1, objS2)).toBeTruthy();
  expect(ObjEqual(objS3, objS2)).toBeFalsy();
  expect(ValEqual(arr1, arr2)).toBeFalsy();
  expect(ValEqual(arr1, obj2)).toBeFalsy();
  expect(ValEqual(new Set(arr1), new Set(arr1))).toBeTruthy();
  expect(ValEqual(new Set(arr1), arr1)).toBeFalsy();
  expect(SetValEqual(new Set(arr1), new Set(arr2))).toBeFalsy();
  const m1 = ObjToMap(obj1);
  const m2 = new Map([
    ['a', '1'],
    ['b', '2'],
  ]);
  const m3 = new Map([
    ['a', '1'],
    ['b', '3'],
  ]);
  const m4 = new Map([['a', '1']]);
  expect(ValEqual(m1, m2)).toBeTruthy();
  expect(ValEqual(m1, obj1)).toBeFalsy();
  expect(ValEqual(obj1, { ...obj1 })).toBeTruthy();
  expect(ValEqual(obj1, null)).toBeFalsy();
  expect(MapEqual(m1, m1)).toBeTruthy();
  expect(MapEqual(m2, m3)).toBeFalsy();
  expect(MapEqual(m1, m4)).toBeFalsy();
});
