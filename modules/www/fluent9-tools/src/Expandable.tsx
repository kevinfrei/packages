import { Button, Divider, Text } from '@fluentui/react-components';
import { ChevronDownRegular, ChevronRightRegular } from '@fluentui/react-icons';
import { ReactElement, useState } from 'react';
import { isString } from '@freik/typechk';

// A little control that expands or collapses the children
// with the header provided
export function Expandable({
  children,
  label,
  defaultShow,
  separator,
  indent,
  size,
}: {
  children: ReactElement | ReactElement[];
  label: string | ReactElement;
  defaultShow?: boolean;
  separator?: boolean;
  indent?: number;
  size?: 'small' | 'medium' | 'large';
}): ReactElement {
  const indentSize = indent || 0;
  const [hidden, setHidden] = useState(!defaultShow);
  const button = (
    <Button
      icon={hidden ? <ChevronRightRegular /> : <ChevronDownRegular />}
      onClick={() => setHidden(!hidden)}
      appearance="transparent"
      size={size ?? 'medium'}
    />
  );
  let theHeader: ReactElement;
  const sz = size || 'medium';
  const tsz = sz === 'medium' ? 500 : size === 'small' ? 300 : 700;
  if (separator) {
    const s = size || 'medium';
    theHeader = (
      <Divider alignContent="start">
        {button}
        {isString(label) ? (
          <Text size={tsz}>
            &nbsp;
            {label}
          </Text>
        ) : (
          label
        )}
      </Divider>
    );
  } else {
    const s = size || 'medium';
    theHeader = (
      <span style={{ marginTop: 10 }}>
        {button}
        {isString(label) ? <Text size={tsz}>{label}</Text> : label}
      </span>
    );
  }
  if (indentSize !== 0) {
    return (
      <>
        {theHeader}
        <div style={hidden ? { display: 'none' } : {}}>
          <span>
            <span style={{ width: indentSize }} />
            <div>{children}</div>
          </span>
        </div>
      </>
    );
  }
  return (
    <>
      {theHeader}
      <div style={hidden ? { display: 'none' } : {}}>{children}</div>
    </>
  );
}
