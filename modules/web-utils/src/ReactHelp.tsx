import { isNumber } from '@freik/typechk';
import React, { useState } from 'react';

const msgsToUse = ['fetching from sources...', 'loading account...'];

export function useRecurringTimeout(
  ms: number,
  func: () => void,
  deps: unknown[],
) {
  return React.useEffect(() => {
    const timeout = setTimeout(() => func(), ms);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [func, ms, ...deps]);
}

export type TextRotaterProps = {
  every?: number;
  messages?: string[];
};

export function TextRotater({
  every,
  messages,
}: TextRotaterProps): JSX.Element {
  // Default to the first message passed
  const msg = messages || msgsToUse;
  const tm = isNumber(every) && every > 0 ? every : 1000;
  const msgLen: number = msg.length;
  const [messageIndex, setMessageIndex] = React.useState(0);
  useRecurringTimeout(
    tm,
    () => {
      setMessageIndex((messageIndex + 1) % msgLen);
    },
    [messages, messageIndex],
  );

  return <div>{msg[messageIndex]}</div>;
}

function randomize(message: string, char: string): string {
  const pos = Math.random() * message.length;
  return message.substring(0, pos) + char + message.substring(pos + 1);
}

export function Snark({
  kind,
  children,
}: {
  kind: string;
  children: string;
}): JSX.Element {
  let char = '🙄';
  switch (kind.toLocaleLowerCase()) {
    case 'grumpy old man':
    case 'back in my day':
    case 'nostalgia':
      char = '👴';
      break;
    default:
      break;
  }
  const [val, setVal] = useState<string>(children);
  useRecurringTimeout(500, () => setVal(randomize(children, char)), [children]);
  return <>{val}</>;
}
