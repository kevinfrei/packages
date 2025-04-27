import * as ofs from 'node:fs';
import { promises as fsp } from 'node:fs';
import path from 'node:path';
import { SpawnRes } from '@freik/spawn';

const fs = {
  readFileAsync: fsp.readFile,
  readFileSync: ofs.readFileSync,
  writeFileAsync: fsp.writeFile,
  writeFileSync: ofs.writeFileSync,
  statAsync: fsp.stat,
  statSync: ofs.statSync,
};

export function FileSizeSync(file: string): number {
  try {
    return fs.statSync(file).size;
  } catch {
    return -1;
  }
}

export async function FileSize(file: string): Promise<number> {
  try {
    return (await fs.statAsync(file)).size;
  } catch {
    return -1;
  }
}

export function ArrayToTextFileSync(arr: string[], fileName: string): void {
  const sep: string = path.sep === '/' ? '\n' : '\r\n';
  const str: string = arr.join(sep);
  fs.writeFileSync(fileName, str);
}

export async function ArrayToTextFile(
  arr: string[],
  fileName: string,
): Promise<void> {
  const sep: string = path.sep === '/' ? '\n' : '\r\n';
  const str: string = arr.join(sep);
  await fs.writeFileAsync(fileName, str);
}

export function TextFileToArraySync(fileName: string): string[] {
  const contents: string = fs.readFileSync(fileName, 'utf8');
  const resultArray = contents.split(/\n|\r/);
  return resultArray.filter((str) => str.trim().length > 0);
}

export async function TextFileToArray(fileName: string): Promise<string[]> {
  const contents: string = await fs.readFileAsync(fileName, 'utf8');
  const resultArray = contents.split(/\n|\r/);
  return resultArray.filter((str) => str.trim().length > 0);
}

export async function HideFile(pathName: string): Promise<string> {
  let targetPath = pathName;
  const base = path.basename(pathName);
  // Hide it for macOS & Linux, if it's not already hidden
  if (!base.startsWith('.')) {
    targetPath = path.join(
      path.dirname(pathName),
      '.' + path.basename(pathName),
    );
    await fsp.rename(pathName, targetPath);
  }
  // this is pretty gross, and only tested on macOS right now
  // I'll get around to testing on Windows and implemented it on Linux some day
  if (process.platform === 'darwin') {
    await SpawnRes('chflags', ['hidden', targetPath]);
  } else if (process.platform === 'win32') {
    await SpawnRes('attrib', ['+H', targetPath.replaceAll('/', '\\')]);
  } else if (process.platform === 'linux') {
    // NYI: https://superuser.com/questions/321109
  }
  return targetPath;
}
