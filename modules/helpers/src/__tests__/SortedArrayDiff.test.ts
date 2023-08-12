import { SortedArrayDiff, SortedArrayDiffSync } from '../Diff';
import { SetDifference } from '../Operations';

function strCmp(a: string, b: string): number {
  return a.localeCompare(b);
}

function striCmp(a: string, b: string): number {
  return a.toLocaleUpperCase().localeCompare(b.toLocaleUpperCase());
}

it('SortedArrayDiffSync', () => {
  const array1 = ['a', 'b', 'd', 'f'];
  const array2 = ['b', 'e', 'f'];
  const subs: string[] = [];
  const adds: string[] = [];
  SortedArrayDiffSync(
    array1,
    array2,
    strCmp,
    (str: string) => adds.push(str),
    (str: string) => subs.push(str),
  );
  expect(adds).toEqual(['e']);
  expect(subs).toEqual(['a', 'd']);
});

function RunDiffSync(
  array1: string[],
  array2: string[],
  adds: string[],
  subs: string[],
) {
  SortedArrayDiffSync(
    array1,
    array2,
    striCmp,
    (str: string) => adds.push(str),
    (str: string) => subs.push(str),
  );
}
it('SortedArrayDiffSync - case insensitive validation', () => {
  const array1 = ['B', 'e', 'f', 'G'];
  const array2 = ['a', 'b', 'd', 'F'];
  let subs: string[] = [];
  let adds: string[] = [];
  RunDiffSync(array1, array2, adds, subs);
  expect(adds).toEqual(['a', 'd']);
  expect(subs).toEqual(['e', 'G']);
  subs = [];
  adds = [];
  RunDiffSync(array2, array1, adds, subs);
  expect(adds).toEqual(['e', 'G']);
  expect(subs).toEqual(['a', 'd']);
});

function GetNumber(max: number): number {
  return Math.floor(Math.random() * max);
}

function GenerateRandomString(len: number): string {
  let str = '';
  for (var i = 0; i < len; i++) {
    str += String.fromCharCode(GetNumber(0x1fdf) + 32);
  }
  return str;
}

function GenerateRandomArray(): string[] {
  return Array.from({ length: GetNumber(200) + 100 }, () =>
    GenerateRandomString(GetNumber(5) + 5),
  );
}

function AddAndRemoveSomeStuff(arr: string[]): {
  addCount: number;
  subCount: number;
  val: string[];
} {
  const val: string[] = [];
  let subCount = 0;
  let addCount = 0;
  for (let i = 0; i < arr.length; i++) {
    const which = GetNumber(4);
    if (which === 0) {
      addCount++;
      val.push(GenerateRandomString(GetNumber(5) + 5));
      i--;
    } else if (which < 3) {
      val.push(arr[i]);
    } else {
      subCount++;
    }
  }
  return { val, subCount, addCount };
}

it('Random SortedArrayDiffSync testing', () => {
  const tmp1 = GenerateRandomArray();
  const { addCount, subCount, val: tmp2 } = AddAndRemoveSomeStuff(tmp1);
  const array1 = tmp1.sort(strCmp);
  const array2 = tmp2.sort(strCmp);
  const set1 = new Set(array1);
  const set2 = new Set(array2);
  const actual_adds = SetDifference(set2, set1);
  const actual_subs = SetDifference(set1, set2);
  expect(addCount).toEqual(actual_adds.size);
  expect(subCount).toEqual(actual_subs.size);
  const subs = new Set<string>();
  const adds = new Set<string>();
  SortedArrayDiffSync(
    array1,
    array2,
    strCmp,
    (str: string) => adds.add(str),
    (str: string) => subs.add(str),
  );
  expect(subs).toEqual(actual_subs);
  expect(adds).toEqual(actual_adds);
});

async function RunDiff(
  array1: number[],
  array2: number[],
  adds: number[],
  subs: number[],
) {
  await SortedArrayDiff(
    array1,
    array2,
    (a, b) => a - b,
    async (str: number) =>
      new Promise<void>((resolve) => {
        adds.push(str);
        resolve();
      }),
    async (str: number) =>
      new Promise<void>((resolve) => {
        subs.push(str);
        resolve();
      }),
  );
}

it('SortedArrayDiff (async)', async () => {
  const array1 = [1, 1, 2, 3, 5];
  const array2 = [1, 2, 5, 13];
  let subs: number[] = [];
  let adds: number[] = [];
  await RunDiff(array1, array2, adds, subs);
  expect(adds).toEqual([13]);
  expect(subs).toEqual([1, 3]);
  adds = [];
  subs = [];
  await RunDiff(array2, array1, adds, subs);
  expect(subs).toEqual([13]);
  expect(adds).toEqual([1, 3]);
});

it('Random SortedArrayDiffAsync testing', async () => {
  const tmp1 = GenerateRandomArray();
  const { addCount, subCount, val: tmp2 } = AddAndRemoveSomeStuff(tmp1);
  const array1 = tmp1.sort(strCmp);
  const array2 = tmp2.sort(strCmp);
  const set1 = new Set(array1);
  const set2 = new Set(array2);
  const actual_adds = SetDifference(set2, set1);
  const actual_subs = SetDifference(set1, set2);
  expect(addCount).toEqual(actual_adds.size);
  expect(subCount).toEqual(actual_subs.size);
  const subs = new Set<string>();
  const adds = new Set<string>();
  await SortedArrayDiff(
    array1,
    array2,
    strCmp,
    async (str: string) =>
      new Promise<void>((resolve) => {
        adds.add(str);
        resolve();
      }),
    async (str: string) =>
      new Promise<void>((resolve) => {
        subs.add(str);
        resolve();
      }),
  );
  expect(subs).toEqual(actual_subs);
  expect(adds).toEqual(actual_adds);
});
