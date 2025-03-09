import * as child_proc from 'child_process';
import { MakeLog } from '@freik/logger';

const { log } = MakeLog('@freik/open-browser');

type BufStr = string | Buffer;

export default function (url: string): void {
  let command = '';
  const plat = process.platform;
  if (/^darwin/.test(plat)) {
    command = 'open';
  } else if (/^win/.test(plat)) {
    command = 'start';
  } else if (/^linux/.test(plat)) {
    command = 'xdg-open';
  } else {
    log(`open a brower to ${url} to launch the application`);
    return;
  }
  child_proc.exec(
    command + ' ' + url,
    (err, stdout: BufStr, stderr: BufStr) => {
      log('stdout: ' + stdout.toString());
      log('stderr: ' + stderr.toString());
      if (err !== null && err !== undefined) {
        log(`exec error: ${JSON.stringify(err)}`);
      }
    },
  );
}
