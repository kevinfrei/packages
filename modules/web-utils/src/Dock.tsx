import { isArray } from '@freik/typechk';
import React from 'react';

const dockStyle = new Map<
  string,
  'column' | 'column-reverse' | 'row' | 'row-reverse'
>([
  ['top', 'column'],
  ['bottom', 'column-reverse'],
  ['left', 'row'],
  ['right', 'row-reverse'],
]);

export type DockProps = {
  location: 'top' | 'bottom' | 'left' | 'right';
  style?: React.CSSProperties;
  children?: JSX.Element | string | (JSX.Element | string)[];
};

const theStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'stretch', // Maybe switch to center based on something?
  alignContent: 'stretch',
  flexBasis: 'auto', // '100%',
};

export function Dock({ location, style, children }: DockProps): JSX.Element {
  const mostChildren = isArray(children)
    ? children.slice(0, children.length - 1)
    : [];
  const lastChild = isArray(children)
    ? children[children.length - 1]
    : children;
  const flexDirection = dockStyle.get(location)!;
  const divStyle = {
    ...theStyle,
    flexDirection,
    justifyContent: flexDirection.indexOf('-') > 0 ? 'flex-end' : 'flex-start',
    ...style,
  };
  return (
    <div className={`Dock${location}`} style={divStyle}>
      {mostChildren}
      <div style={{ flexGrow: 1 }}>{lastChild}</div>
    </div>
  );
}
