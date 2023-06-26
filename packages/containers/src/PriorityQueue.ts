import { isEmpty } from '@freik/typechk';
import { PriorityQueue, isContainer } from './Types.js';

export function MakePriorityQueue<T>(
  getPriority: (obj: T) => number,
  items?: Iterable<T>,
): PriorityQueue<T> {
  type Elem = { item: T; priority: number; innerPriority: number };
  // This is just a min-heap
  const heap: Elem[] = [];
  let innerPri = -0x7ffffff;
  function isGt(a: number, b: number): boolean {
    const ha = heap[a];
    const hb = heap[b];
    return (
      (ha && hb && ha.priority > hb.priority) ||
      (ha &&
        hb &&
        ha.priority === hb.priority &&
        ha.innerPriority > hb.innerPriority)
    );
  }
  function isLt(a: number, b: number): boolean {
    const ha = heap[a];
    const hb = heap[b];
    return (
      hb === undefined ||
      ha.priority < hb.priority ||
      (ha.priority === hb.priority && ha.innerPriority < hb.innerPriority)
    );
  }

  function upPos(pos: number): number {
    return Math.floor((pos - 1) / 2);
  }
  // This is slightly tricky when they're equal
  function downPos(pos: number): number {
    const p1 = pos * 2 + 1;
    const p2 = pos * 2 + 2;
    return pos * 2 + (isLt(p1, p2) ? 1 : 2);
  }
  // Swap between two elements
  function swap(oPos: number, nPos: number): number {
    const tmp = heap[oPos];
    heap[oPos] = heap[nPos];
    heap[nPos] = tmp;
    return nPos;
  }
  // Is the element correctly heap'ed with the parent?
  function upOrdered(pos: number): boolean {
    return pos === 0 || isGt(pos, upPos(pos));
  }
  // Is the element correctly heap'ed with it's two children
  function downOrdered(pos: number): boolean {
    const l = pos * 2 + 1;
    const r = l + 1;
    return (
      (l >= heap.length || isLt(pos, l)) && (r >= heap.length || isLt(pos, r))
    );
  }
  function push(item: T) {
    const priority = getPriority(item);
    // this *could* cause problems with innerPri if it loops around at 53 bits...
    heap.push({ item, priority, innerPriority: innerPri++ });
    // Now 'up-heap'
    for (
      let pos = heap.length - 1;
      !upOrdered(pos);
      pos = swap(pos, upPos(pos)) // eslint-disable-next-line no-empty
    ) {}
  }
  function pushMany(elems: Iterable<T>) {
    for (const c of elems) push(c);
  }
  function pop(): T | undefined {
    if (empty()) {
      return;
    }
    const tail = heap.pop()!;
    if (empty()) {
      return tail.item;
    }
    const res = heap[0].item;
    if (!empty()) {
      heap[0] = tail;
      // now 'down-heap'
      // eslint-disable-next-line no-empty
      for (let pos = 0; !downOrdered(pos); pos = swap(pos, downPos(pos))) {}
    }
    return res;
  }
  function size(): number {
    return heap.length;
  }
  function empty(): boolean {
    return heap.length === 0;
  }
  function peek(): T | undefined {
    if (!empty() && heap[0] !== undefined) {
      return heap[0].item;
    }
  }
  function* iterator(): Generator<T> {
    while (!empty()) yield pop()!;
  }
  if (!isEmpty(items)) {
    pushMany(items);
  }
  return {
    push,
    pushMany,
    pop,
    size,
    peek,
    empty,
    [Symbol.iterator]: iterator,
    type: 'pqueue',
  };
}

export function isPriorityQueue(obj: unknown): obj is PriorityQueue<unknown> {
  return isContainer(obj) && obj.type === 'pqueue';
}

export function isPriorityQueueOf<T>(obj: unknown): obj is PriorityQueue<T> {
  return isPriorityQueue(obj);
}
