export type DialogApi<T> = {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: (response: T) => void;
};
