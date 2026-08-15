import { useState } from 'react';
import type { ReactElement } from 'react';

import { Button, Divider, Text } from '@fluentui/react-components';
import { ChevronDownRegular, ChevronRightRegular } from '@fluentui/react-icons';
import { isString } from '@freik/typechk';

export type ExpandableProps = {
  children: ReactElement | ReactElement[];
  label: string | ReactElement;
  defaultShow?: boolean;
  separator?: boolean;
  indent?: number;
  size?: 'small' | 'medium' | 'large';
  onChanged?: (isOpen: boolean) => void;
};

// A little control that expands or collapses the children
// with the header provided
export function Expandable({
  children,
  label,
  defaultShow,
  separator,
  indent,
  size,
  onChanged,
  ...props
}: ExpandableProps): ReactElement {
  const indentSize = indent || 0;
  const [hidden, setHidden] = useState(!defaultShow);
  const button = (
    <Button
      appearance="transparent"
      icon={hidden ? <ChevronRightRegular /> : <ChevronDownRegular />}
      onClick={() => {
        setHidden(!hidden);
        if (onChanged) {
          onChanged(hidden);
        }
      }}
      size={size || 'medium'}
    />
  );
  const lbl = isString(label) ? <Text {...props}>&nbsp;{label}</Text> : label;
  const theHeader = separator ? (
    <Divider alignContent="start">
      {button}
      {lbl}
    </Divider>
  ) : (
    <span style={{ marginTop: 10 }}>
      {button}
      {isString(label) ? <Text {...props}>{label}</Text> : label}
    </span>
  );
  const padding = indentSize ? { paddingLeft: indentSize } : {};
  const display = hidden ? { display: 'none' } : {};
  return (
    <div>
      {theHeader}
      <div style={{ ...padding, ...display }}>{children}</div>
    </div>
  );
}
