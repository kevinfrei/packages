import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Input,
  useId,
  Text,
  Label,
  InputProps,
} from '@fluentui/react-components';
import { DialogData } from '@freik/react-tools';
import { isString } from '@freik/typechk';
import { useCallback, useState } from 'react';

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

export function TextInputDialog({
  data: [hidden, hide],
  onConfirm,
  title,
  text,
  initialValue,
  yesText,
  noText,
}: TextInputProps): React.JSX.Element {
  const [input, setInput] = useState(initialValue);
  const confirmAndClose = () => {
    hide();
    onConfirm(input);
  };
  const yes = yesText ?? 'Yes';
  const no = noText ?? 'No';
  /*
    const dlgContentProps = {
    type: DialogType.normal,
    title,
    closeButtonAriaLabel: 'Close',
    subText: text,
  };
  */
  const openEl = isString(opener) ? <Button>{opener}</Button> : opener;
  const id = useId();
  const onChange: InputProps['onChange'] = useCallback(
    (ev, data) => {
      setInput(data.value ?? initialValue);
    },
    [initialValue],
  );
  return (
    <Dialog
    /*
      hidden={hidden}
      onDismiss={hide}
      minWidth={minWidth}
      maxWidth={maxWidth}
      dialogContentProps={dlgContentProps}
      */
    >
      <DialogTrigger>{openEl}</DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            <Label htmlFor={id}>{text}</Label>
            <Input value={input} onChange={onChange} />
          </DialogContent>
          <DialogActions>
            <Button style={{ float: 'left' }} onClick={hide}>
              {no}
            </Button>
            <Button style={{ float: 'right' }} onClick={confirmAndClose}>
              {yes}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
