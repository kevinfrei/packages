import { ReactElement, useCallback, useState } from 'react';

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
  InputProps,
  Label,
  useId,
} from '@fluentui/react-components';
import { isString } from '@freik/typechk';

import { DialogApi } from './Types';

export type TextInputProps = {
  api: DialogApi<string | undefined>;
  title: string;
  text: string;
  initialValue?: string;
  children?: ReactElement | string;
  confirm?: string | ReactElement;
  cancel?: string | ReactElement;
};

export function TextInputDialog({
  api,
  title,
  text,
  initialValue,
  confirm,
  cancel,
  children,
}: TextInputProps): React.JSX.Element {
  const [input, setInput] = useState(initialValue ?? '');
  const confirmEl = confirm ?? 'OK';
  const cancelEl = cancel ?? 'Cancel';
  const openEl: ReactElement | false = isString(children) ? (
    <Button onClick={api.openDialog}>{children}</Button>
  ) : (
    children || false
  );
  const confirmFunc = useCallback(() => api.closeDialog(input), [api, input]);
  const cancelFunc = useCallback(() => api.closeDialog(undefined), [api]);
  const id = useId();
  const onChange: InputProps['onChange'] = useCallback(
    (ev, data) => {
      setInput(data.value ?? initialValue ?? '');
    },
    [initialValue],
  );
  return (
    <Dialog open={api.isOpen}>
      {openEl ? (
        <DialogTrigger disableButtonEnhancement>{openEl}</DialogTrigger>
      ) : (
        <></>
      )}
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            <Label htmlFor={id}>{text}</Label>
            <br />
            <Input value={input} onChange={onChange} />
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button onClick={confirmFunc}>{confirmEl}</Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
              <Button onClick={cancelFunc}>{cancelEl}</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
