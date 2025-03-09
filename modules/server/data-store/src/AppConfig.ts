import { Pickle, Unpickle } from '@freik/typechk';
import * as ofs from 'fs';
import * as os from 'os';
import * as path from 'path';

const fs = {
  readFileAsync: ofs.promises.readFile,
  writeFileAsync: ofs.promises.writeFile,
  readFileSync: ofs.readFileSync,
  writeFileSync: ofs.writeFileSync,
};

export function GetFilePath(name: string): string {
  return path.join(os.homedir(), '.config', `${name}.json`);
}

export function GetSync(name: string): unknown {
  const configFile = GetFilePath(name);
  try {
    const contents: string = fs.readFileSync(configFile, 'utf8');
    return Unpickle(contents);
  } catch {
    return;
  }
}

export async function Get(name: string): Promise<unknown> {
  const configFile = GetFilePath(name);
  try {
    const contents: string = await fs.readFileAsync(configFile, 'utf8');
    return Unpickle(contents);
  } catch {
    return;
  }
}

export function SaveSync(name: string, data: unknown): boolean {
  const configFile = GetFilePath(name);
  try {
    fs.writeFileSync(configFile, Pickle(data), 'utf8');
    return true;
  } catch {
    return false;
  }
}

export async function Save(name: string, data: unknown): Promise<boolean> {
  const configFile = GetFilePath(name);
  try {
    await fs.writeFileAsync(configFile, Pickle(data), 'utf8');
    return true;
  } catch {
    return false;
  }
}

export {
  Get as GetAsync,
  Get as Read,
  Get as ReadAsync,
  Get as Load,
  Get as LoadAsync,
  GetSync as ReadSync,
  GetSync as LoadSync,
  Save as SaveAsync,
  Save as Set,
  Save as SetAsync,
  Save as Write,
  Save as WriteAsync,
  SaveSync as SetSync,
  SaveSync as WriteSync,
};
