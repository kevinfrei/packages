import * as fs from 'fs';
import { promises as fsp } from 'fs';
import { Path } from '@freik/files';
import { MakeLog } from '@freik/logger';
import SeqNum from '@freik/seqnum';
import {
  MakeReaderWriter,
  OnlyOneWaiting,
  ReaderWriter,
  SyncFunc,
} from '@freik/sync';
import { hasStrField } from '@freik/typechk';

const { log, err } = MakeLog('node-utils:persist');

export type ValueUpdateListener = (val: string) => void;

export type Persist = {
  getLocation(): string;
  getItemSync(key: string): string | void;
  getItem(key: string): Promise<string | void>;
  setItemSync(key: string, value: string): void;
  setItem(key: string, value: string): Promise<void>;
  deleteItemSync(key: string): void;
  deleteItem(key: string): Promise<void>;
  subscribe(key: string, listener: ValueUpdateListener): string;
  unsubscribe(id: string): boolean;
};

export function MakePersistence(location: string): Persist {
  const memoryCache = new Map<string, string>();
  const listeners = new Map<string, Map<string, ValueUpdateListener>>();
  const getNextListenerId = SeqNum();

  const lockers = new Map<string, ReaderWriter>();

  function getLock(id: string): ReaderWriter {
    const locker = lockers.get(id);
    if (locker !== undefined) {
      return locker;
    } else {
      const res = MakeReaderWriter(0);
      lockers.set(id, res);
      return res;
    }
  }

  // Here's a place for app settings & stuff...
  function getLocation(): string {
    return Path.Xplat(location);
  }
  function storageLocation(id: string): string {
    return Path.Join(getLocation(), `${id}.json`);
  }

  log(`User data location: ${storageLocation('test')}`);

  function readFile(id: string): string | void {
    let data = memoryCache.get(id);
    if (data) {
      return data;
    }
    try {
      data = fs.readFileSync(storageLocation(id), 'utf8');
      if (data) {
        memoryCache.set(id, data);
        return data;
      }
    } catch (e) {
      if (e instanceof Error && hasStrField(e, 'code') && e.code === 'ENOENT') {
        return;
      }
      err('Error occurred during readFile');
      err(e);
    }
  }

  async function readFileAsync(id: string): Promise<string | void> {
    const data = memoryCache.get(id);
    if (data) {
      log('returning cached data for ' + id);
      return data;
    }
    const lock = getLock(id);
    await lock.read();
    try {
      const contents = await fsp.readFile(storageLocation(id), 'utf8');
      memoryCache.set(id, contents);
      return contents;
    } catch (e) {
      if (e instanceof Error && hasStrField(e, 'code') && e.code === 'ENOENT') {
        return;
      }
      err('Error occurred during readFileAsync');
      err(e);
    } finally {
      lock.leaveRead();
    }
  }

  function writeFile(id: string, val: string): void {
    memoryCache.set(id, val);

    try {
      fs.mkdirSync(getLocation(), { recursive: true });
    } catch {
      /* */
    }
    fs.writeFileSync(storageLocation(id), val, 'utf8');
  }

  const writers = new Map<string, SyncFunc<boolean>>();

  async function writeFileAsync(id: string, val: string): Promise<void> {
    try {
      await fsp.mkdir(getLocation(), { recursive: true });
    } catch {
      /* */
    }
    const lock = getLock(id);
    await lock.write();
    memoryCache.set(id, val);
    try {
      if (!writers.has(id)) {
        writers.set(
          id,
          OnlyOneWaiting(async () => {
            // If we've deleted the id, don't re-save
            const recentVal = memoryCache.get(id);
            if (recentVal !== undefined) {
              // We might have deleted the value since the last save, I suppose
              await fsp.writeFile(storageLocation(id), recentVal, 'utf8');
            }
          }, 500),
        );
      }
      const func = writers.get(id);
      if (!func)
        throw Error('Horrific synchronization bug in persist.writeFileAsync');
      await func();
    } finally {
      lock.leaveWrite();
    }
  }

  function deleteFileSync(id: string) {
    try {
      fs.unlinkSync(storageLocation(id));
      memoryCache.delete(id);
    } catch (e) {
      err('Error occurred during deleteFile');
      err(e);
    }
  }

  // FIXME: This is a nasty bug waiting to happen, when coupled with writeFile :/
  async function deleteFile(id: string) {
    const lock = getLock(id);
    await lock.write();
    try {
      memoryCache.delete(id);
      await fsp.unlink(storageLocation(id));
    } catch (e) {
      err('Error occurred during deleteFileAsync');
      err(e);
    } finally {
      lock.leaveWrite();
    }
  }

  function notify(key: string, val: string) {
    // For each listener, invoke the listening function
    const ls = listeners.get(key);
    if (!ls) return;
    for (const [, fn] of ls) {
      log(`Updating ${key} to ${val}`);
      fn(val);
    }
  }

  // Add a function to run when a value is persisted
  function subscribe(key: string, listener: ValueUpdateListener): string {
    const id = getNextListenerId();
    let keyListeners = listeners.get(key);
    if (!keyListeners) {
      keyListeners = new Map();
      listeners.set(key, keyListeners);
    }
    keyListeners.set(id, listener);
    return `${id}-${key}`;
  }

  // Remove the listening function with the given id
  function unsubscribe(id: string): boolean {
    const splitPt = id.indexOf('-');
    const actualId = id.substr(0, splitPt);
    const keyName = id.substr(splitPt + 1);
    const keyListeners = listeners.get(keyName);
    if (!keyListeners) {
      return false;
    }
    return keyListeners.delete(actualId);
  }

  // Get a value from disk/memory
  function getItemSync(key: string): string | void {
    log('Reading ' + key);
    return readFile(key);
  }

  // Get a value from disk/memory
  async function getItem(key: string): Promise<string | void> {
    log('Async Reading ' + key);
    return await readFileAsync(key);
  }

  // Save a value to disk and cache it
  function setItemSync(key: string, value: string): void {
    if (getItemSync(key) === value) {
      log(`No change to ${key} - not re-writing`);
    } else {
      log(`Writing ${key}:`);
      log(value);
      writeFile(key, value);
      notify(key, value);
    }
  }

  // Async Save a value to disk and cache it
  async function setItem(key: string, value: string): Promise<void> {
    if ((await getItem(key)) === value) {
      log(`No change to ${key} - not re-writing`);
    } else {
      log(`Async Writing ${key}:`);
      log(value);
      await writeFileAsync(key, value);
      notify(key, value);
    }
  }

  // Delete an item (and remove it from the cache)
  function deleteItemSync(key: string): void {
    log(`deleting ${key}`);
    deleteFileSync(key);
  }

  // Async Delete an item (and remove it from the cache)
  async function deleteItem(key: string): Promise<void> {
    log(`deleting ${key}`);
    await deleteFile(key);
  }
  return {
    getLocation,
    getItemSync,
    getItem,
    setItemSync,
    setItem,
    deleteItemSync,
    deleteItem,
    subscribe,
    unsubscribe,
  };
}
