import type { SimpleMetadata } from '@freik/media-core';
import { FileUtil, PathUtil } from '@freik/node-utils';
import * as path from 'node:path';
import { isString } from '@freik/typechk';
import { FlacAsync } from './encode.js';


export type ToFlacRes = { success: number; failure: number; log: string[] };

export type Track = {
  track: string;
  title: string;
  artist: string;
  start: string;
};

export type File = {
  artist: string;
  album: string;
  file: string;
  year?: string;
  tracks: Track[];
  log: string[];
};

export function ParseFile(cue: string[]): File | string {
  const log: string[] = [];
  let year = '';
  let artist = '';
  let album = '';
  let file = '';
  let lastStart = '';
  let lastTrack = '';
  let lastTitle = '';
  let lastArtist = '';
  const tracks: Track[] = [];
  let firstUnindent = true;
  let lineNo = 0;
  for (const line of cue) {
    const trim = line.trim();
    if (trim !== line) {
      // Indented lines:
      if (firstUnindent) {
        // Let's make sure we've seen the lines we needed
        firstUnindent = false;
        if (artist === '' || album === '' || file === '') {
          return 'Failed to get artist and album from cue file';
        }
      }
      if (trim.startsWith('TRACK ') && trim.endsWith(' AUDIO')) {
        if (lastStart !== '') {
          // We have a previous track: Push it on the tracks list
          tracks.push({
            track: lastTrack,
            title: lastTitle,
            artist: lastArtist,
            start: lastStart,
          });
          lastTrack = '';
          lastTitle = '';
          lastArtist = '';
          lastStart = '';
        }
        lastTrack = trim.substring(6, trim.length - 6);
      } else if (trim.startsWith('TITLE "') && trim.endsWith('"')) {
        lastTitle = trim.substring(7, trim.length - 1);
      } else if (trim.startsWith('PERFORMER "') && trim.endsWith('"')) {
        lastArtist = trim.substring(11, trim.length - 1);
      } else if (trim.startsWith('INDEX ') && lastStart === '') {
        lastStart = trim.substring(9).trim();
      } else {
        log.push(`Skipping line ${lineNo}: ${trim}`);
      }
    } else {
      // Unindented lines:
      if (line.startsWith('FILE "') && line.endsWith('" WAVE') && file === '') {
        file = line.substring(6, line.length - 6);
      } else if (line.startsWith('REM DATE ') && year === '') {
        year = line.substring(9);
      } else if (
        line.startsWith('PERFORMER "') &&
        line.endsWith('"') &&
        artist === ''
      ) {
        artist = line.substring(11, line.length - 1);
      } else if (
        line.startsWith('TITLE "') &&
        line.endsWith('"') &&
        album === ''
      ) {
        album = line.substring(7, line.length - 1);
      } else {
        log.push(`Ignoring line ${line}`);
      }
    }
    lineNo++;
  }
  tracks.push({
    track: lastTrack,
    title: lastTitle,
    artist: lastArtist,
    start: lastStart,
  });
  const res: File = {
    artist,
    album,
    file,
    tracks: tracks.map((trck) => ({
      ...trck,
      start: `${trck.start.substring(0, 5)}.${trck.start.substring(6)}`,
    })),
    log,
  };
  if (year !== '') {
    res.year = year;
  }
  return res;
}

export async function ToFlac(filename: string): Promise<ToFlacRes> {
  const cueText = await FileUtil.textFileToArrayAsync(filename);
  // Parse the cue file:
  const cue = ParseFile(cueText);
  if (isString(cue)) {
    return {
      success: -1,
      failure: -1,
      log: [`Failed to parse CUE file:${cue}`],
    };
  }
  // Okay, got the list of tracks. Let's make files from them!
  const res: ToFlacRes = { success: 0, failure: 0, log: [] };
  let end = '';
  const metadata: SimpleMetadata = {
    artist: cue.artist,
    album: cue.album,
    track: '',
    title: '',
  };
  if (cue.year !== '') {
    metadata.year = cue.year;
  }
  const dirname = path.dirname(filename);
  for (const track of cue.tracks.reverse()) {
    try {
      const args: Record<string, string | null> = {};
      if (track.start !== '00:00.00') {
        args[`-skip=${track.start}`] = null;
      }
      if (end.length) {
        args[`-until=${end}`] = null;
      }
      const newFile: string = path.join(
        dirname,
        PathUtil.fileClean(`${track.track} - ${track.title}.flac`),
      );
      metadata.track = track.track;
      metadata.title = track.title;
      if (
        await FlacAsync(
          path.join(dirname, cue.file),
          newFile,
          args as Record<string, string>,
          metadata,
        )
      ) {
        res.success++;
      } else {
        res.log.push(`File ${track.track} - ${track.title} failed to encode`);
        res.failure++;
      }
    } catch (error) {
      res.log.push(`File ${track.track} - ${track.title} failed`);
      res.failure++;
    }
    end = track.start;
  }
  return res;
}
