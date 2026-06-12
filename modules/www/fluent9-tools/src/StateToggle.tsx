import { BoolState } from '@freik/react-tools';

type StateToggleProps = {
  label: string;
  state: BoolState;
  disabled?: boolean;
  style?: IStyle;
};
// A helper for a toggle that uses a BoolState variable
export function StateToggle({
  label,
  state,
  disabled,
  style,
}: StateToggleProps): React.JSX.Element {
  const customStyle: Partial<IToggleStyles> = {};
  if (style) {
    customStyle.root = style;
  }
  return (
    <Toggle
      inlineLabel
      disabled={disabled}
      label={label}
      checked={state[0]}
      styles={customStyle}
      onChange={(_ev, checked?: boolean) => state[checked ? 2 : 1]()}
    />
  );
}
