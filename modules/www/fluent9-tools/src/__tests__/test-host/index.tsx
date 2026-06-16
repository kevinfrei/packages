import { use, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThumbDislikeRegular } from '@fluentui/react-icons';
import { Expandable } from '../../Expandable';
import { StateToggle } from '../../StateToggle';
import { useBoolState } from '@freik/react-tools';
import { ConfirmationDialog } from '../../ConfirmationDialog';
import { TextInputDialog } from '../../TextInputDialog';
import { MakeDialogApi } from '../../DialogHelpers';
import { SpinSuspense } from '../../SpinSuspense';
import {
  FluentProvider,
  Text,
  webLightTheme,
} from '@fluentui/react-components';

// Create a promise that resolves after 2 seconds
function createDelayedPromise(): Promise<{ message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ message: '"Data loaded" after 2 seconds!' });
    }, 2000);
  });
}

// IMPORTANT: Create the promise ONCE outside the component
// to prevent infinite re-renders
const dataPromise = createDelayedPromise();

function DelayedComponent() {
  // 2. Unwrap the promise with use()
  const data = use(dataPromise);
  return <Text>{data.message}</Text>;
}

function App() {
  const st = useBoolState(true);
  const [val, setVal] = useState('no response yet');
  const [tVal, setTVal] = useState('no response yet');
  const dlgState = useBoolState(false);
  const api = MakeDialogApi(dlgState, (val: boolean) => {
    setVal(val ? 'CONFIRMED!' : 'DENIED!');
  });
  const txtState = useBoolState(false);
  const txtApi = MakeDialogApi(txtState, (val: string | undefined) => {
    setTVal(val || 'NOT DEFINED!');
  });
  return (
    <FluentProvider theme={webLightTheme} targetDocument={window.document}>
      <div style={{ padding: 10 }}>
        <Expandable label="Some stuff" indent={35}>
          <div> A</div>
          <div>b</div>
        </Expandable>
        And some other stuff
        <StateToggle state={st} label="State toggler" />
      </div>
      <ConfirmationDialog
        api={api}
        yes="Yup"
        no={<ThumbDislikeRegular />}
        text={'Hit a button'}
        title={"Do somthing'"}
      >
        Show Confirmation
      </ConfirmationDialog>
      <p>{val}</p>
      <p>
        <SpinSuspense label="Waiting" size="large">
          <DelayedComponent />
        </SpinSuspense>
      </p>
      <TextInputDialog
        api={txtApi}
        confirm="CONFIRM"
        cancel={<ThumbDislikeRegular />}
        text="THis is the text!"
        title="This is the title"
        initialValue="init"
      >
        Show Text Input
      </TextInputDialog>
      <p>Input Value: {tVal}</p>
    </FluentProvider>
  );
}

const rootEl = document.getElementById('root')!;

const root =
  (rootEl as any)._root ?? ((rootEl as any)._root = createRoot(rootEl));

root.render(<App />);
