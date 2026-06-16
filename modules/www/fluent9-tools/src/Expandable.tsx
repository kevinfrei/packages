import { Button, Divider, Text } from '@fluentui/react-components';
import { ChevronDownRegular, ChevronRightRegular } from '@fluentui/react-icons';
import { useState } from 'react';
import { isString } from '@freik/typechk';
import type { ReactElement } from 'react';

export type ExpandableProps = {
  children: ReactElement | ReactElement[];
  label: string | ReactElement;
  defaultShow?: boolean;
  separator?: boolean;
  indent?: number;
  size?: 'small' | 'medium' | 'large';
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
}: ExpandableProps): ReactElement {
  const [hidden, setHidden] = useState(!defaultShow);
  const button = (
    <Button
      icon={hidden ? <ChevronRightRegular /> : <ChevronDownRegular />}
      onClick={() => setHidden(!hidden)}
      appearance="transparent"
      size={size ?? 'medium'}
    />
  );
  const tsz =
    (size || 'medium') === 'medium' ? 500 : size === 'small' ? 300 : 700;
  const lbl = isString(label) ? <Text size={tsz}>&nbsp;{label}</Text> : label;
  const theHeader = separator ? (
    <Divider alignContent="start">
      {button}
      {lbl}
    </Divider>
  ) : (
    <span style={{ marginTop: 10 }}>
      {button}
      {lbl}
    </span>
  );
  const divStyle = { display: hidden ? 'none' : 'flex', gap: 0 };
  return (
    <div>
      {theHeader}
      <div style={divStyle}>
        <span style={{ width: indent || 0 }} />
        <span>{children}</span>
      </div>
    </div>
  );
}
