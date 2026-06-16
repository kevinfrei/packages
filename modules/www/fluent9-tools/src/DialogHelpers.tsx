import { BoolState } from '@freik/react-tools';
import { DialogApi } from './Types';

export function MakeDialogApi<T>(
  boolState: BoolState,
  handler: (res: T) => void,
): DialogApi<T> {
  return {
    isOpen: boolState[0],
    openDialog: boolState[2],
    closeDialog: (response: T) => {
      boolState[1]();
      handler(response);
    },
  };
}
