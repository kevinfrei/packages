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
import {isString} from '@freik/typechk';

export type TextInputProps = {
  data: DialogData;
  onConfirm: (value: string) => void;
  title: string;
  text: string;
  initialValue: string;
  yesText?: string;
  noText?: string;
  minWidth?: number;
  maxWidth?: number;
};

export function TextInput({
  data: [hidden, hide],
  onConfirm,
  title,
  text,
  initialValue,
  yesText,
  noText,
  minWidth,
  maxWidth,
}: TextInputProps): React.JSX.Element {
  const [input, setInput] = useState(initialValue);
  const confirmAndClose = () => {
    hide();
    onConfirm(input);
  };
  const yes = yesText ?? 'Yes';
  const no = noText ?? 'No';
  const dlgContentProps = {
    type: DialogType.normal,
    title,
    closeButtonAriaLabel: 'Close',
    subText: text,
  };
  return (
    <Dialog
      hidden={hidden}
      onDismiss={hide}
      minWidth={minWidth}
      maxWidth={maxWidth}
      dialogContentProps={dlgContentProps}
    >
      <Stack>
        <Text>{text}</Text>
        <TextField
          value={input}
          onChange={(ev, newValue) => setInput(newValue ?? initialValue)}
        />
        <br />
      </Stack>
      <DialogFooter>
        <PrimaryButton style={{ float: 'left' }} onClick={hide}>
          {no}
        </PrimaryButton>
        <DefaultButton style={{ float: 'right' }} onClick={confirmAndClose}>
          {yes}
        </DefaultButton>
      </DialogFooter>
    </Dialog>
  );
}

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
  const openEl = isString(open) ? (<Button>{open}</Button>) : open;
  return (
    <Dialog
      {...props}
    >
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
