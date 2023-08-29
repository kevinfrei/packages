import { isEmpty } from '@freik/typechk';
import { Queue, isContainer } from './Types.js';

export function MakeQueue<T>(items?: Iterable<T>): Queue<T> {
  const q: T[] = isEmpty(items) ? [] : [...items];
  function push(item: T) {
    q.push(item);
  }
  function pushMany(elems: Iterable<T>) {
    for (const c of elems) q.push(c);
  }
  function pop(): T | undefined {
    return q.shift();
  }
  function size(): number {
    return q.length;
  }
  function empty(): boolean {
    return q.length === 0;
  }
  function peek(): T | undefined {
    if (!empty()) {
      return q[0];
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
    type: 'queue',
  };
}

export function isQueue(obj: unknown): obj is Queue<unknown> {
  return isContainer(obj) && obj.type === 'queue';
}

export function isQueueOf<T>(obj: unknown): obj is Queue<T> {
  return isQueue(obj);
}
