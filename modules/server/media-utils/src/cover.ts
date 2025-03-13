import { MimeData } from '@freik/media-core';
import { promises as fs } from 'fs';
import { IAudioMetadata, selectCover } from 'music-metadata';
import { parseFile } from 'music-metadata';

async function AcquireMetadata(pathname: string): Promise<IAudioMetadata> {
  return await parseFile(pathname);
}

const mime2suffix = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/gif', '.gif'],
]);

/*
const header2mime = new Map<string, string>([
  ['/9j/4A', 'image/jpeg'],
  ['iVBORw', 'image/png'],
  ['R0lGOD', 'image/gif'],
]);
*/

function bufferToBase64(buffer: Uint8Array): string {
  const output: string[] = [];

  for (let i = 0, length = buffer.byteLength; i < length; i++) {
    const chr = buffer.at(i);
    if (chr !== undefined) {
      output.push(String.fromCharCode(chr));
    }
  }

  return btoa(output.join(''));
}

export async function ReadFromFile(
  audioFile: string,
): Promise<MimeData | void> {
  const { common } = await AcquireMetadata(audioFile);
  const cover = selectCover(common.picture);
  if (!cover) return;
  return {
    data: await bufferToBase64(cover.data),
    type: cover?.format,
  };
}

export async function ToFile(
  audioFile: string,
  outputFileNoSuffix: string,
): Promise<string | void> {
  const data = await ReadFromFile(audioFile);
  if (!data) return;
  const info = mime2suffix.get(data.type);
  const fileName = outputFileNoSuffix + (info ?? '');
  await fs.writeFile(fileName, data.data, 'base64');
  return fileName;
}
