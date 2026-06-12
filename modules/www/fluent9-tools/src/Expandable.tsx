import {
  IconButton,
  IFontStyles,
  ISeparatorStyles,
  IStyle,
  IToggleStyles,
  Separator,
  Spinner as FluentSpinner,
  SpinnerLabelPosition,
  SpinnerSize,
  Stack,
  Text,
  Toggle,
} from '@fluentui/react';
import React, { Suspense, useState } from 'react';
import { BoolState } from '@freik/react-tools';
import { isString } from '@freik/typechk';

// A little control that expands or collapses the children
// with the header provided
export function Expandable({
  children,
  label,
  defaultShow,
  separator,
  variant,
  indent,
}: {
  children: React.JSX.Element | React.JSX.Element[];
  label: string | React.JSX.Element;
  defaultShow?: boolean;
  separator?: boolean;
  variant?: keyof IFontStyles;
  indent?: number;
}): React.JSX.Element {
  const indentSize = indent || 0;
  const [hidden, setHidden] = useState(!defaultShow);
  const button = (
    <IconButton
      iconProps={{
        iconName: hidden ? 'ChevronRight' : 'ChevronDown',
      }}
      onClick={() => setHidden(!hidden)}
    />
  );
  let theHeader: React.JSX.Element;
  if (separator) {
    const customStyle: Partial<ISeparatorStyles> = {
      root: { marginLeft: '-10px' },
    };
    const v = variant || 'large';
    theHeader = (
      <Separator alignContent="start" styles={customStyle}>
        {button}
        {isString(label) ? (
          <Text variant={v}>
            &nbsp;
            {label}
          </Text>
        ) : (
          label
        )}
      </Separator>
    );
  } else {
    const v = variant || 'medium';
    theHeader = (
      <Stack horizontal verticalAlign="center" style={{ marginTop: 10 }}>
        {button}
        {isString(label) ? <Text variant={v}>{label}</Text> : label}
      </Stack>
    );
  }
  if (indentSize !== 0) {
    return (
      <>
        {theHeader}
        <div style={hidden ? { display: 'none' } : {}}>
          <Stack horizontal>
            <span style={{ width: indentSize }} />
            <div>{children}</div>
          </Stack>
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
