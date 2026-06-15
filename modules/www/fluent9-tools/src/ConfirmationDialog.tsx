import React, { ReactElement } from 'react';
import { DialogData, DialogState } from '@freik/react-tools';
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
  state: DialogState;
  confirmFunc: () => void;
  title: string | ReactElement;
  text: string | ReactElement;
  yes?: string | ReactElement;
  no?: string | ReactElement;
  open: string | ReactElement;
  modalType?: DialogModalType;
};

export function ConfirmationDialog({
  state,
  confirmFunc,
  title,
  text,
  yes,
  no,
  open,
}: ConfirmationDialogProps): React.JSX.Element {
  const [closer, [isHidden, opener]] = state;
  const yesEl = yes ?? 'Yes';
  const noEl = no ?? 'No';
  const openEl = isString(open) ? <Button>{open}</Button> : open;
  return (
    <Dialog open={isHidden}>
      <DialogTrigger disableButtonEnhancement>{openEl}</DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{text}</DialogContent>
          <DialogActions>
            <Button
              appearance="primary"
              onClick={() => {
                closer();
                confirmFunc();
              }}
            >
              {yesEl}
            </Button>
            <DialogTrigger disableButtonEnhancement>
              <Button onClick={closer}>{noEl}</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
