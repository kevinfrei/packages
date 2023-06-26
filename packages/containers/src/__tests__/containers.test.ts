import { Pickle, SafelyUnpickle, isNumber, isString } from '@freik/typechk';
import {
  MakeMultiMap,
  MakePriorityQueue,
  MakeQueue,
  MakeStack,
  MultiMap,
  chkMultiMapOf,
  isContainer,
  isContainerOf,
  isMultiMapOf,
  isPriorityQueue,
  isPriorityQueueOf,
  isQueue,
  isQueueOf,
  isStack,
  isStackOf,
} from '../index';

test('Basic MultiMap tests', async () => {
  const mmap = MakeMultiMap<number, string>();
  expect(mmap).toBeDefined();
  expect(mmap.size()).toEqual(0);
  mmap.set(0, 'zero');
  expect(mmap.size()).toEqual(1);
  const item0 = mmap.get(0);
  expect(mmap.get(0)).toBeDefined();
  if (!item0) throw Error('failed');
  expect(item0.size).toEqual(1);
  mmap.set(0, 'zilch');
  expect(mmap.size()).toEqual(1);
  expect(item0.size).toEqual(2);
  mmap.add(1, ['one']);
  mmap.add(1, ['uno', 'un']);
  expect(mmap.size()).toEqual(2);
  const item1 = mmap.get(1);
  expect(item1).toBeDefined();
  if (!item1) throw Error('failed');
  expect(item1.size).toEqual(3);
  for (const [key, values] of mmap) {
    const s = new Set(values);
    if (key === 0) {
      expect(s.size).toBe(2);
    } else if (key === 1) {
      expect(s.size).toBe(3);
    } else {
      expect(null).toBeTruthy();
    }
  }
  let seen = 2;
  await mmap.forEachAwaitable(async (val, key, map) => {
    if (key === 0) seen -= 3;
    if (key === 1) seen += 1;
    seen += val.size;
  });
  expect(seen).toEqual(5);
  seen = -1;
  mmap.forEach(async (val, key, map) => {
    if (key === 0) seen -= 3;
    if (key === 1) seen += 1;
    seen += val.size;
  });
  expect(seen).toEqual(2);
  const json = Pickle(mmap);
  const fromJson = SafelyUnpickle(
    json,
    (obj: unknown): obj is MultiMap<number, string> =>
      isMultiMapOf(obj, isNumber, isString),
  );
  expect(fromJson).toBeDefined();
  if (!fromJson) throw Error('oops');
  const json2 = Pickle(fromJson);
  expect(json).toEqual(json2);
  expect(fromJson.valueEqual(mmap)).toBeTruthy();
  expect(mmap.valueEqual(fromJson)).toBeTruthy();
  fromJson.delete(0);
  expect(fromJson.valueEqual(mmap)).toBeFalsy();
  expect(mmap.valueEqual(fromJson)).toBeFalsy();
  fromJson.set(5, 'cinq');
  expect(fromJson.valueEqual(mmap)).toBeFalsy();
  expect(mmap.valueEqual(fromJson)).toBeFalsy();
  fromJson.delete(5);
  fromJson.set(0, 'zilch');
  fromJson.set(0, 'zero');
  expect(fromJson.valueEqual(mmap)).toBeTruthy();
  expect(mmap.valueEqual(fromJson)).toBeTruthy();
  fromJson.remove(1, 'uno');
  expect(fromJson.valueEqual(mmap)).toBeFalsy();
  expect(mmap.valueEqual(fromJson)).toBeFalsy();
  expect(mmap.remove(1, 'un')).toBeTruthy();
  expect(mmap.remove(1, 'un')).toBeFalsy();
  expect(mmap.remove(15, 'nope')).toBeFalsy();
  const un = mmap.get(1);
  expect(un).toBeDefined();
  if (!un) throw Error('oopsy');
  expect(un.size).toEqual(2);
  expect(mmap.remove(1, 'uno')).toBeTruthy();
  expect(mmap.remove(1, 'one')).toBeTruthy();
  expect(mmap.remove(1, 'une')).toBeFalsy();
});

test('MultiMap type tests', () => {
  const mmns = MakeMultiMap([
    [1, 'a'],
    [2, 'b'],
  ]);
  expect(isMultiMapOf(mmns, isNumber, isString)).toBeTruthy();
  expect(isMultiMapOf(mmns, isNumber, isNumber)).toBeFalsy();
  expect(chkMultiMapOf(isNumber, isNumber)(mmns)).toBeFalsy();
  expect(isMultiMapOf(mmns, isString, isNumber)).toBeFalsy();
  expect(isMultiMapOf({}, isNumber, isNumber)).toBeFalsy();
});

test('Queue tests', () => {
  const q = MakeQueue([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  expect(q.size()).toEqual(10);
  expect(q.peek()).toEqual(1);
  expect(q.pop()).toEqual(1);
  expect(q.size()).toEqual(9);
  q.push(11);
  while (!q.empty()) {
    expect(q.peek()).toEqual(q.pop());
  }
  for (let i = 0; i < 10; i++) {
    q.push(i);
  }
  q.pushMany([10, 11, 12, 13]);
  let j = 0;
  for (const v of q) {
    expect(v).toEqual(j++);
  }
  const q2 = MakeQueue<number>();
  expect(isQueue(q)).toBeTruthy();
  expect(isQueueOf<number>(q2)).toBeTruthy();
  expect(isStack(q)).toBeFalsy();
});

test('Stack tests', () => {
  const s = MakeStack([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  expect(s.size()).toEqual(10);
  expect(s.peek()).toEqual(10);
  expect(s.pop()).toEqual(10);
  expect(s.size()).toEqual(9);
  let val = 9;
  while (!s.empty()) {
    const f = Math.floor(Math.random() * 1000);
    const cur = s.peek();
    s.push(f);
    expect(s.peek()).toEqual(f);
    expect(s.pop()).toEqual(f);
    expect(s.pop()).toEqual(val--);
  }
  for (let i = 0; i < 10; i++) {
    s.push(i);
  }
  s.pushMany([10, 11, 12, 13]);
  let j = 13;
  for (const v of s) {
    expect(v).toEqual(j--);
  }
  const s2 = MakeStack<number>();
  s2.push(1);
  expect(s2.pop()).toEqual(1);
  expect(isStack(s)).toBeTruthy();
  expect(isStackOf<number>(s2)).toBeTruthy();
  expect(isPriorityQueue(s)).toBeFalsy();
});

test('Priority Queue tests', () => {
  const pq = MakePriorityQueue<number>((val: number) => val);
  let max = -1;
  // First, in order
  for (let i = 0; i < 100; i++) {
    pq.push(i);
  }
  while (!pq.empty()) {
    const val = pq.peek();
    expect(val).toBeDefined();
    if (val === undefined) throw 'oops';
    expect(val).toBeGreaterThan(max);
    expect(pq.pop()).toEqual(val);
    max = val;
  }
  max = -1;
  // Next, in reverse order
  for (let i = 100; i > 0; i--) {
    pq.push(i);
  }
  while (!pq.empty()) {
    const val = pq.peek();
    expect(val).toBeDefined();
    if (val === undefined) throw 'oops';
    expect(val).toBeGreaterThan(max);
    expect(pq.pop()).toEqual(val);
    max = val;
  }
  max = -1;
  // Finally, mix it up
  for (let i = 0; i < 10000; i++) {
    const val = Math.floor(Math.random() * 100) + 1;
    pq.push(val);
  }
  pq.pushMany([-1, -1, -1]);
  expect(pq.size()).toEqual(10003);
  for (const val of pq) {
    expect(val).toBeGreaterThanOrEqual(max);
    max = val;
  }
  expect(pq.pop()).toBeUndefined();
  const dpq = MakePriorityQueue<string>(
    (obj) => obj.charCodeAt(0),
    ['world', 'hello', 'there'],
  );
  expect(dpq.pop()).toEqual('hello');
  expect(dpq.pop()).toEqual('there');
  expect(dpq.pop()).toEqual('world');
  expect(isPriorityQueue(dpq)).toBeTruthy();
  expect(isPriorityQueueOf<string>(dpq)).toBeTruthy();
  expect(isQueue(dpq)).toBeFalsy();
  expect(isContainerOf<string>(dpq)).toBeTruthy();
});
