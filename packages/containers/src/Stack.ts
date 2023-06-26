import { isEmpty } from '@freik/typechk';
import { Stack, isContainer } from './Types.js';

export function MakeStack<T>(items?: Iterable<T>): Stack<T> {
  const s: T[] = isEmpty(items) ? [] : [...items];
  function push(item: T) {
    s.push(item);
  }
  function pushMany(elems: Iterable<T>) {
    for (const c of elems) s.push(c);
  }
  function pop(): T | undefined {
    return s.pop();
  }
  function size(): number {
    return s.length;
  }
  function empty(): boolean {
    return s.length === 0;
  }
  function peek(): T | undefined {
    if (!empty()) {
      return s[s.length - 1];
    }
  }
  function* iterator(): Generator<T> {
    while (!empty()) yield pop()!;
  }
  return {
    push,
    pushMany,
    pop,
    size,
    peek,
    empty,
    [Symbol.iterator]: iterator,
    type: 'stack',
  };
}

export function isStack(obj: unknown): obj is Stack<unknown> {
  return isContainer(obj) && obj.type === 'stack';
}

export function isStackOf<T>(obj: unknown): obj is Stack<T> {
  return isStack(obj);
}
