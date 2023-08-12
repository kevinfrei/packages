import { isPromise } from '@freik/typechk';

export type ElemHandlerAsync<T> = (pathName: T) => Promise<void>;
export type ElemHandlerSync<T> = (pathName: T) => void;
export type ElemHandlerEither<T> = ElemHandlerSync<T> | ElemHandlerAsync<T>;
export type ElemHandlerBoth<T> = (pathName: T) => Promise<void> | void;
export type ElemHandlerAll<T> = ElemHandlerBoth<T> | ElemHandlerEither<T>;

/* This requires that both arrays are already sorted */
export async function SortedArrayDiff<T>(
  oldList: T[],
  newList: T[],
  comparisonFunc: (a: T, b: T) => number,
  addFn?: ElemHandlerAll<T>,
  delFn?: ElemHandlerAll<T>,
): Promise<void> {
  let oldIndex = 0;
  let newIndex = 0;
  while (oldIndex < oldList.length && newIndex < newList.length) {
    const oldItem = oldList[oldIndex];
    const newItem = newList[newIndex];
    const comp = comparisonFunc(oldItem, newItem);
    if (comp === 0) {
      oldIndex++;
      newIndex++;
    } else if (comp < 0) {
      // old item goes "before" new item, so we've deleted old item
      if (delFn) {
        const foo = delFn(oldItem);
        if (isPromise(foo)) {
          await foo;
        }
      }
      oldIndex++;
    } /* if (comp > 0) */ else {
      // new item goes "before" old item, so we've added new item
      if (addFn) {
        const bar = addFn(newItem);
        if (isPromise(bar)) {
          await bar;
        }
      }
      newIndex++;
    }
  }
  if (delFn) {
    for (; oldIndex < oldList.length; oldIndex++) {
      const res = delFn(oldList[oldIndex]);
      if (isPromise(res)) {
        await res;
      }
    }
  }
  if (addFn) {
    for (; newIndex < newList.length; newIndex++) {
      const res = addFn(newList[newIndex]);
      if (isPromise(res)) {
        await res;
      }
    }
  }
}

export function SortedArrayDiffSync<T>(
  oldList: T[],
  newList: T[],
  comparisonFunc: (a: T, b: T) => number,
  addFn?: ElemHandlerSync<T>,
  delFn?: ElemHandlerSync<T>,
): void {
  let oldIndex = 0;
  let newIndex = 0;
  while (oldIndex < oldList.length && newIndex < newList.length) {
    const oldItem = oldList[oldIndex];
    const newItem = newList[newIndex];
    const comp = comparisonFunc(oldItem, newItem);
    if (comp === 0) {
      oldIndex++;
      newIndex++;
    } else if (comp < 0) {
      // old item goes "before" new item, so we've deleted old item
      if (delFn) {
        delFn(oldItem);
      }
      oldIndex++;
    } /* if (comp > 0) */ else {
      // new item goes "before" old item, so we've added new item
      if (addFn) {
        addFn(newItem);
      }
      newIndex++;
    }
  }
  if (delFn) {
    for (; oldIndex < oldList.length; oldIndex++) {
      delFn(oldList[oldIndex]);
    }
  }
  if (addFn) {
    for (; newIndex < newList.length; newIndex++) {
      addFn(newList[newIndex]);
    }
  }
}
