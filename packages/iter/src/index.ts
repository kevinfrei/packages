export declare type IterExpr<T> = {
  forEach: (fn: (v: T) => void) => void;
  reduce: <U>(
    fn: (prevVal: U, curVal: T, index?: number) => U,
    initVal: U,
  ) => U;

  every: (fn: (v: T, idx: number) => unknown) => boolean;
  all: (fn: (v: T, idx: number) => unknown) => boolean;
  some: (fn: (v: T, idx: number) => unknown) => boolean;

  filter: (fn: (v: T, idx: number) => boolean) => IterExpr<T>;
  where: (fn: (v: T, idx: number) => boolean) => IterExpr<T>;

  map: <U>(fn: (v: T, idx: number) => U) => IterExpr<U>;
  select: <U>(fn: (v: T, idx: number) => U) => IterExpr<U>;

  toArray: () => T[];
  toIterable: () => Iterable<T>;
  entries: () => Iterable<[number, T]>;
  values: () => Iterable<T>;
};

export function Iter<T>(col: Iterable<T>): IterExpr<T> {
  // TODO: Make a helper to allow cached results
  // TODO: Add Concat capabilities

  const items = [col];

  function* theCollection() {
    for (const item of items) {
      for (const elem of item) {
        yield elem;
      }
    }
  }

  function forEach(arg: (v: T) => void) {
    for (const v of theCollection()) {
      arg(v);
    }
  }
  function* runFilter(fn: (v: T, index: number) => boolean) {
    let idx = 0;
    for (const i of theCollection()) {
      if (fn(i, idx++)) {
        yield i;
      }
    }
  }

  function* runMap<U>(fn: (v: T, index: number) => U) {
    let idx = 0;
    for (const i of theCollection()) {
      yield fn(i, idx++);
    }
  }

  function filter(fn: (v: T, index: number) => boolean) {
    return Iter(runFilter(fn));
  }

  function map<U>(fn: (v: T, index: number) => U) {
    return Iter(runMap(fn));
  }

  function reduce<U>(fn: (pv: U, cv: T, index: number) => U, initVal: U) {
    let val = initVal;
    let i = 0;
    for (const cur of theCollection()) {
      val = fn(val, cur, i++);
    }
    return val;
  }

  function toArray() {
    const res = [];
    for (const cur of theCollection()) {
      res.push(cur);
    }
    return res;
  }

  function toIterable() {
    return theCollection();
  }

  function* entries(): Generator<[number, T]> {
    let i = 0;
    for (const v of theCollection()) {
      yield [i, v];
      i++;
    }
  }

  function every(fn: (v: T, index: number) => unknown) {
    let idx = 0;
    for (const val of theCollection()) {
      if (!fn(val, idx++)) {
        return false;
      }
    }
    return true;
  }

  function some(fn: (v: T, index: number) => unknown) {
    let idx = 0;
    for (const val of theCollection()) {
      if (fn(val, idx++)) {
        return true;
      }
    }
    return false;
  }

  return {
    forEach,
    filter,
    where: filter,
    map,
    select: map,
    reduce,
    every,
    all: every,
    some,
    toArray,
    toIterable,
    entries,
    values: toIterable,
  };
}

/*
function MakeArray(count: number): number[] {
  const data: number[] = Array(count) as number[];
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.round(Math.random() * 100);
  }
  return data;
}

// How do I want to use this stuff?

function ArrayUsage(count: number) {
  const data = MakeArray(count)
    .filter((d) => d % 2 === 0)
    .reduce((pv, cv) => pv + cv, 0);
  console.log(data);
}

function* MakeIter(count: number) {
  for (let i = 0; i < count; i++) {
    yield Math.round(Math.random() * 100);
  }
  return count;
}

function MakeHugeIter(count: number) {
  return Iter(MakeIter(count));
}

function IterUsage(count: number) {
  const data = MakeHugeIter(count)
    .filter((d) => d % 2 === 0)
    .reduce((pv, cv) => pv + cv, 0);
  console.log(data);
}

function HybridUsage(count: number) {
  const data = Iter(MakeArray(count))
    .filter((d) => d % 2 === 0)
    .reduce((pv, cv) => pv + cv, 0);
  console.log(data);
}

const lo = 10;
const hi = 14;
const num = 5;
function getSize(val: number): number {
  // eslint-disable-next no-bitwise
  return 1 << (val * 2);
}

ArrayUsage(100);
for (let i = lo; i < hi; i++) {
  let total = 0;
  for (let j = 0; j < num; j++) {
    const before = Date.now();
    ArrayUsage(getSize(i));
    const elapsed = Date.now() - before;
    total += elapsed;
  }
  console.log(`Array ${i}: ${total}`);
}
IterUsage(100);
for (let i = lo; i < hi; i++) {
  let total = 0;
  for (let j = 0; j < num; j++) {
    const before = Date.now();
    IterUsage(getSize(i));
    const elapsed = Date.now() - before;
    total += elapsed;
  }
  console.log(`Iter ${i}: ${total}`);
}
HybridUsage(100);
for (let i = lo; i < hi; i++) {
  let total = 0;
  for (let j = 0; j < num; j++) {
    const before = Date.now();
    HybridUsage(getSize(i));
    const elapsed = Date.now() - before;
    total += elapsed;
  }
  console.log(`Hybrid ${i}: ${total}`);
}
*/

// This is probably a better way to go... Nesting isn't as readable, but 'fits' better, IMO

export function* IMap<I, J>(
  container: IterableIterator<J>,
  func: (o: J, index?: number) => I,
): IterableIterator<I> {
  let idx = 0;
  for (const i of container) {
    yield func(i, idx);
    idx++;
  }
}

export function* IFilter<I>(
  container: IterableIterator<I>,
  func: (O: I, index?: number) => boolean,
): IterableIterator<I> {
  let idx = 0;
  for (const i of container) {
    if (func(i, idx)) {
      yield i;
    }
    idx++;
  }
}

export function IForEach<I>(
  container: IterableIterator<I>,
  func: (o: I, index?: number) => void,
): void {
  let idx = 0;
  for (const i of container) {
    func(i, idx);
    idx++;
  }
}

export function* ISkip<I>(
  container: IterableIterator<I>,
  skip: number,
): IterableIterator<I> {
  for (const i of container) {
    if (skip <= 0) yield i;
    else skip--;
  }
}

export function IAny<I>(
  container: IterableIterator<I>,
  func: (o: I, index?: number) => boolean,
): boolean {
  let idx = 0;
  for (const i of container) {
    if (func(i, idx)) return true;
    idx++;
  }
  return false;
}

export function IAll<I>(
  container: IterableIterator<I>,
  func: (o: I, index?: number) => boolean,
): boolean {
  let idx = 0;
  for (const i of container) {
    if (!func(i, idx)) return false;
    idx++;
  }
  return true;
}

export function IReduce<I, J>(
  container: IterableIterator<J>,
  func: (prevVal: I, curVal: J, index?: number) => I,
  initVal: I,
): I {
  let res: I = initVal;
  let idx = 0;
  for (const c of container) {
    res = func(res, c, idx);
    idx++;
  }
  return res;
}

export function* IZip<I, J>(
  container1: IterableIterator<I>,
  container2: IterableIterator<J>,
): IterableIterator<[I, J]> {
  let ii: IteratorResult<I> = container1.next();
  let jj: IteratorResult<J> = container2.next();
  while (!ii.done && !jj.done) {
    yield [ii.value, jj.value];
    ii = container1.next();
    jj = container2.next();
  }
}
