import { useState } from 'react';

/**
 * @deprecated - Just use BoolState
 */
export type DialogData = [boolean, () => void];
/**
 * A simplifier for dialogs: [0] shows the dialog, [1] is used in the dialog
 * @deprecated - Just use BoolState
 */
export type DialogState = [() => void, DialogData];
// [state, show (set true), hide (set false)]
export type BoolState = [boolean, () => void, () => void];

export interface KeyEventType {
  key: string;
}

/**
 * A short cut for on/off states to make some things (like dialogs) cleaner
 *
 * @returns {BoolState} [state, trueSetter(), falseSetter()]
 */
export function useBoolState(initial: boolean): BoolState {
  const [state, setState] = useState(initial);
  return [state, () => setState(false), () => setState(true)];
}

/**
 * I should go back and see why I made this. This seems more convoluted than just
 * using BoolState :/ So I'm thinking @deprecated 
 * */
export function useDialogState(): DialogState {
  const [isHidden, setHidden] = useState(true);
  return [() => setHidden(false), [isHidden, () => setHidden(true)]];
}
