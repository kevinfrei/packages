import { ReactElement, useCallback } from 'react';
import type { DialogApi } from './Types';
import { BoolState } from '@freik/react-tools';
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
  api: DialogApi<boolean>;
  title: string | ReactElement;
  text: string | ReactElement;
  yes?: string | ReactElement;
  no?: string | ReactElement;
  modalType?: DialogModalType;
  children: ReactElement | string;
};

export function ConfirmationDialog({
  api,
  title,
  text,
  yes,
  no,
  children,
}: ConfirmationDialogProps): ReactElement {
  const yesEl = yes ?? 'Yes';
  const noEl = no ?? 'No';
  const openEl: ReactElement = isString(children) ? (
    <Button onClick={api.openDialog}>{children}</Button>
  ) : (
    children
  );
  const yesFunc = useCallback(() => api.closeDialog(true), [api]);
  const noFunc = useCallback(() => api.closeDialog(false), [api]);
  return (
    <Dialog open={api.isOpen}>
      <DialogTrigger disableButtonEnhancement>{openEl}</DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{text}</DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button onClick={yesFunc}>{yesEl}</Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
              <Button onClick={noFunc}>{noEl}</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
