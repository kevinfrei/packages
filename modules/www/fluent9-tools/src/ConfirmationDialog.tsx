import { ReactElement, useCallback } from 'react';
import { BoolState, DialogState } from '@freik/react-tools';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogModalType,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
} from '@fluentui/react-components';
import { isString } from '@freik/typechk';

export type ConfirmationDialogProps = {
  state: BoolState;
  confirmFunc: (which: boolean) => void;
  title: string | ReactElement;
  text: string | ReactElement;
  yes?: string | ReactElement;
  no?: string | ReactElement;
  modalType?: DialogModalType;
  children: ReactElement | string;
};

export function ConfirmationDialog({
  state,
  confirmFunc,
  title,
  text,
  yes,
  no,
  children,
}: ConfirmationDialogProps): ReactElement {
  const [isOpened, setClosed, setOpened] = state;
  const yesEl = yes ?? 'Yes';
  const noEl = no ?? 'No';
  const openEl: ReactElement = isString(children) ? (
    <Button onClick={setOpened}>{children}</Button>
  ) : (
    children
  );
  const yesFunc = useCallback(() => {
    setClosed();
    confirmFunc(true);
  }, [setClosed, confirmFunc]);
  const noFunc = useCallback(() => {
    setClosed();
    confirmFunc(false);
  }, [setClosed, confirmFunc]);
  return (
    <Dialog open={isOpened}>
      <DialogTrigger disableButtonEnhancement>{openEl}</DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{text}</DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button onClick={yesFunc}>{yesEl}</Button>
            </DialogTrigger>{' '}
            <DialogTrigger disableButtonEnhancement>
              <Button onClick={noFunc}>{noEl}</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
