type WatchItems = string | Iterable<string>;
export type Watcher = {
  (str: string): boolean;
  addToIgnoreList(this: Watcher, ...types: WatchItems[]): Watcher;
  addToWatchList(this: Watcher, ...types: WatchItems[]): Watcher;
  watching(type: string): boolean;
};
