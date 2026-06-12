import React, { ReactElement } from 'react';
import { useState } from 'react';
import { DialogData } from '@freik/react-tools';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogProps,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
} from '@fluentui/react-components';
import { isString } from '@freik/typechk';

export type ConfirmationDialogProps = {
  data: DialogData;
  confirmFunc: () => void;
  title: string | ReactElement;
  text: string | ReactElement;
  yes?: string | ReactElement;
  no?: string | ReactElement;
  open: string | ReactElement;
} & DialogProps;

export function ConfirmationDialog({
  data: [isHidden, hiderFunc],
  confirmFunc,
  title,
  text,
  yes,
  no,
  open,
  ...props
}: ConfirmationDialogProps): React.JSX.Element {
  const yesEl = yes ?? 'Yes';
  const noEl = no ?? 'No';
  const openEl = isString(open) ? <Button>{open}</Button> : open;
  return (
    <Dialog {...props}>
      <DialogTrigger>{openEl}</DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{text}</DialogContent>
          <DialogActions>
            <Button
              style={{ float: 'left' }}
              appearance="primary"
              onClick={() => {
                hiderFunc();
                confirmFunc();
              }}
            >
              {yesEl}
            </Button>
            <DialogTrigger disableButtonEnhancement>
              <Button style={{ float: 'right' }} onClick={hiderFunc}>
                {noEl}
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
