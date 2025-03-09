import { isString } from '@freik/typechk';
import * as path from 'path';

import type { Watcher } from './public-defs';

/**
 * Returns a data structure designed to let you opt in, or opt out, of specific
 * strings. Use `addToWatchList` to "opt in", and use `addToIgnoreList` to opt
 * out. These two combine (and preempt eachother). If you only have an ignore
 * list, `watching(str)` will return `true` for everything not on the list. If
 * you only have a watch list, `watching(str)` will return `false` for
 * everything not on the list.
 * @returns Watcher
 */
export function MakeSuffixWatcher(...maybeWatchList: string[]): Watcher {
  const toWatch = new Set<string>();
  const toIgnore = new Set<string>();
  function getExt(str: string): string {
    return path.extname(str).toLocaleLowerCase();
  }
  function shouldWatch(type: string): boolean {
    return toWatch.size === 0 || toWatch.has(getExt(type));
  }
  function shouldIgnore(type: string): boolean {
    return toIgnore.size !== 0 && toIgnore.has(getExt(type));
  }
  function addToWatchList(
    this: Watcher,
    ...types: (string | Iterable<string>)[]
  ): Watcher {
    for (const type of types) {
      for (const elem of isString(type) ? [type] : type) {
        const val = elem.startsWith('.')
          ? elem.toLocaleLowerCase()
          : '.' + elem.toLocaleLowerCase();
        toWatch.add(val);
        toIgnore.delete(val);
      }
    }
    return this;
  }
  function addToIgnoreList(
    this: Watcher,
    ...types: (string | Iterable<string>)[]
  ): Watcher {
    for (const type of types) {
      for (const elem of isString(type) ? [type] : type) {
        const val = elem.startsWith('.')
          ? elem.toLocaleLowerCase()
          : '.' + elem.toLocaleLowerCase();
        toIgnore.add(val);
        toWatch.delete(val);
      }
    }
    return this;
  }
  function watching(type: string) {
    return !shouldIgnore(type) && shouldWatch(type);
  }
  watching.addToIgnoreList = addToIgnoreList;
  watching.addToWatchList = addToWatchList;
  watching.watching = watching;
  if (maybeWatchList) {
    watching.addToWatchList(maybeWatchList);
  }
  return watching;
}
