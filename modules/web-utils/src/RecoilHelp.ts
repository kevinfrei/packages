import { RecoilValueReadOnly, useRecoilCallback } from 'recoil';
import debugModule from 'debug';
import {
  atom,
  CallbackInterface,
  DefaultValue,
  RecoilState,
  selectorFamily,
  SerializableParam,
  SetterOrUpdater,
  useRecoilState,
} from 'recoil';
import { BoolState, KeyEventType } from './Hooks.js';

const log = debugModule('web-utils:recoil-helpers');
const err = debugModule('web-utils:recoil-helpers:err');

export type StatePair<T> = [T, SetterOrUpdater<T>];

export function MakeSetSelector<T extends SerializableParam>(
  setOfObjsState: RecoilState<Set<T>>,
  key: string,
): (param: T) => RecoilState<boolean> {
  return selectorFamily<boolean, T>({
    key,
    get:
      (item: T) =>
      ({ get }) =>
        get(setOfObjsState).has(item),
    set:
      (item: T) =>
      ({ set }, newValue) =>
        set(setOfObjsState, (prevVal: Set<T>) => {
          const newSet = new Set<T>(prevVal);
          if (newValue) {
            newSet.delete(item);
          } else {
            newSet.add(item);
          }
          return newSet;
        }),
  });
}

export function MakeSetState<T extends SerializableParam>(
  key: string,
  //  from: RecoilState<Iterable<T>>
): [RecoilState<Set<T>>, (param: T) => RecoilState<boolean>] {
  const theAtom = atom({ key, default: new Set<T>() });
  return [theAtom, MakeSetSelector(theAtom, `${key}:sel`)];
}

export function useBoolRecoilState(theAtom: RecoilState<boolean>): BoolState {
  const [state, setState] = useRecoilState(theAtom);
  return [state, () => setState(false), () => setState(true)];
}

export type AtomEffectParams<T> = {
  node: RecoilState<T>;
  trigger: 'get' | 'set';
  // Callbacks to set or reset the value of the atom.
  // This can be called from the atom effect function directly to initialize the
  // initial value of the atom, or asynchronously called later to change it.
  setSelf: (
    newVal:
      | T
      | DefaultValue
      | Promise<T | DefaultValue> // Only allowed for initialization at this time
      | ((curVal: T | DefaultValue) => T | DefaultValue),
  ) => void;
  resetSelf: () => void;

  // Subscribe to changes in the atom value.
  // The callback is not called due to changes from this effect's own setSelf().
  onSet: (
    func: (newValue: T | DefaultValue, oldValue: T | DefaultValue) => void,
  ) => void;
};

/*
To get off of the AtomEffects API, I need three things:
1. a 'get' mechanism to initialize backing atoms
2. a 'set' mechanism to send data back to the server when it's changed (for RW atoms)
3. an async update mechanism to update backing atoms

#1 can be accomplished by using a helper component with an effect to pull the value
from the server, and store it back to the backing atom

#2 should just work with selectors, no magic involved, really

#3 can be in the same helper component for #1
*/

// Initial value 'getter' effect:
// for each atom that's registered, queue up a query to load the initial value
// Set up handlers so that those values update the backing atoms

const registeredAtoms: RecoilState<unknown>[] = [];

export function getAtomValuesEffect(): void {
  for (const theAtom of registeredAtoms) {
    log('Registered Atom:');
    log(theAtom);
  }
}

type KeyboardHookType<T extends KeyEventType> = (
  cbIntfc: CallbackInterface,
) => (ev: T) => void;

let lastHeard = performance.now();

export function keyboardHook<T extends KeyEventType>(
  filterState: RecoilState<string>,
): KeyboardHookType<T> {
  return ({ set }: CallbackInterface) =>
    (ev: T) => {
      err(ev.key);
      if (ev.key.length > 1 || ev.key === ' ') {
        set(filterState, '');
        return;
      }
      const time = performance.now();
      const clear: boolean = time - lastHeard > 750;
      lastHeard = time;
      set(filterState, (curVal) => (clear ? ev.key : curVal + ev.key));
    };
}

export type MyTransactionInterface = {
  get: <T>(recoilVal: RecoilState<T> | RecoilValueReadOnly<T>) => T;
  set: <T>(
    recoilVal: RecoilState<T>,
    valOrUpdater: ((currVal: T) => T) | T,
  ) => void;
  reset: <T>(recoilVal: RecoilState<T>) => void;
};

type FnType<Args extends readonly unknown[], Return> = (
  ...args: Args
) => Return;

// I'm making my own hook to use instead of the currently-too-constrained
// useRecoilTransaction hook
export function useMyTransaction<Args extends readonly unknown[], Return>(
  fn: (ntrface: MyTransactionInterface) => FnType<Args, Return>,
): FnType<Args, Return> {
  return useRecoilCallback(({ set, reset, snapshot }) => {
    const get = <T>(recoilVal: RecoilState<T> | RecoilValueReadOnly<T>) =>
      snapshot.getLoadable(recoilVal).getValue();
    return fn({ set, reset, get });
  });
}
