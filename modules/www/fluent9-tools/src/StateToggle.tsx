import { CSSProperties, useCallback } from 'react';

import { Switch } from '@fluentui/react-components';
import { BoolState } from '@freik/react-tools';

type StateToggleProps = {
  label: string;
  state: BoolState;
  disabled?: boolean;
  style?: CSSProperties;
};
// A helper for a toggle that uses a BoolState variable
export function StateToggle({
  label,
  state,
  disabled,
}: StateToggleProps): React.JSX.Element {
  const onChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      state[ev.currentTarget.checked ? 2 : 1]();
    },
    [state],
  );
  return (
    <Switch
      disabled={disabled}
      label={label}
      checked={state[0]}
      onChange={onChange}
    />
  );
}
