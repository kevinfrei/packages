import React from 'react';

export type FillProps = {
  direction?:
    | 'vertical'
    | 'horizontal'
    | 'v'
    | 'h'
    | 'row'
    | 'r'
    | 'column'
    | 'c';
  style?: React.CSSProperties;
  children?: JSX.Element | string | (JSX.Element | string)[];
};

const baseStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
};

export function Fill({
  direction: which,
  style,
  children,
}: FillProps): JSX.Element {
  const divStyle = { ...baseStyle, ...style };
  if (which && (which[0] === 'v' || which[0] === 'c')) {
    divStyle.flexDirection = 'row';
    divStyle.height = '100%';
  } else {
    divStyle.flexDirection = 'column';
    divStyle.width = '100%';
  }
  return (
    <div className={`Fill${which ?? 'undefined'}`} style={divStyle}>
      {children}
    </div>
  );
}
