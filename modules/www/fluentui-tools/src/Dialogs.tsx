import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  PrimaryButton,
  Stack,
  Text,
  TextField,
} from '@fluentui/react';
import React from 'react';
import { useState } from 'react';
import { DialogData } from '@freik/react-tools';

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
  title: string;
  text: string;
  yesText?: string;
  noText?: string;
  minWidth?: number;
  maxWidth?: number;
};

export function ConfirmationDialog({
  data: [isHidden, hiderFunc],
  confirmFunc,
  title,
  text,
  yesText,
  noText,
  minWidth,
  maxWidth,
}: ConfirmationDialogProps): React.JSX.Element {
  const yes = yesText ?? 'Yes';
  const no = noText ?? 'No';
  return (
    <Dialog
      title={title}
      maxWidth={maxWidth}
      minWidth={minWidth}
      hidden={isHidden}
      onDismiss={hiderFunc}
    >
      <Stack>
        <Text>{text}</Text>
        <br />
        <div>
          <DefaultButton
            style={{ float: 'left' }}
            onClick={() => {
              hiderFunc();
              confirmFunc();
            }}
          >
            {yes}
          </DefaultButton>
          <PrimaryButton style={{ float: 'right' }} onClick={hiderFunc}>
            {no}
          </PrimaryButton>
        </div>
      </Stack>
    </Dialog>
  );
}
