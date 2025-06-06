// Module:
// media/decode
// Provides compressed audio to wav file tools
// Everything is synchronous currently

// import { PathUtil, ProcUtil } from '@freik/node-utils';

import { SpawnRes, SpawnResSync } from '@freik/spawn';
import type { Decoder, DecoderAsync } from './index.js';
import * as path from 'path';
import { Path } from '@freik/files';

const Mp3: Decoder = (inputFile, outputFile) =>
  SpawnResSync('lame', ['--quiet', '--decode', inputFile, outputFile]);

const Mp3Async: DecoderAsync = (inputFile, outputFile) =>
  SpawnRes('lame', ['--quiet', '--decode', inputFile, outputFile]);

const Flac: Decoder = (inputFile, outputFile) =>
  SpawnResSync('flac', ['-d', inputFile, '-o', outputFile]);

const FlacAsync: DecoderAsync = (inputFile, outputFile) =>
  SpawnRes('flac', ['-d', inputFile, '-o', outputFile]);

const Aac: Decoder = (inputFile, outputFile) =>
  SpawnResSync('faad', ['-o', outputFile, inputFile]);

const AacAsync: DecoderAsync = (inputFile, outputFile) =>
  SpawnRes('faad', ['-o', outputFile, inputFile]);

const Ffmpeg: Decoder = (inputFile, outputFile) =>
  SpawnResSync('ffmpeg', ['-i', inputFile, outputFile]);

const FfmpegAsync: DecoderAsync = (inputFile, outputFile) =>
  SpawnRes('ffmpeg', ['-i', inputFile, outputFile]);

// K: we know we need to convert it.
// First convert it to a .wav file
const MakeWave = (inputFile: string, fileTypeMB?: string): string | void => {
  const wavConvert: {
    [key: string]: Decoder;
  } = {
    mp3: Mp3,
    flac: Flac,
    wma: Ffmpeg,
    mp4: Aac,
    aac: Aac,
    m4a: Aac,
    m4b: Aac,
  };

  let fileType: string = fileTypeMB || path.extname(inputFile);
  if (fileType.length > 0 && fileType[0] === '.') {
    fileType = fileType.substring(1);
  }
  if (fileType.length < 1) {
    return;
  }
  if (fileType === 'wav') {
    return inputFile;
  }
  const tmpFile: string = Path.GetTemp('decode', 'wav');
  if (wavConvert[fileType] === undefined) {
    throw new Error('Unknown file type:' + fileType);
  }
  if (wavConvert[fileType](inputFile, tmpFile)) {
    return tmpFile;
  }
};

// K: we know we need to convert it.
// First convert it to a .wav file
const MakeWaveAsync = async (
  inputFile: string,
  fileTypeMB?: string,
): Promise<string | void> => {
  const wavConvert: {
    [key: string]: DecoderAsync;
  } = {
    mp3: Mp3Async,
    flac: FlacAsync,
    wma: FfmpegAsync,
    mp4: AacAsync,
    aac: AacAsync,
    m4a: AacAsync,
    m4b: AacAsync,
  };
  let fileType: string = fileTypeMB || path.extname(inputFile);
  if (fileType.length > 0 && fileType[0] === '.') {
    fileType = fileType.substring(1);
  }
  if (fileType.length < 1) {
    return;
  }
  if (fileType === 'wav') {
    return inputFile;
  }
  const tmpFile: string = Path.GetTemp('decode', 'wav');
  if (wavConvert[fileType] === undefined) {
    throw new Error('Unknown file type:' + fileType);
  }
  if (await wavConvert[fileType](inputFile, tmpFile)) {
    return tmpFile;
  }
};

export {
  Aac,
  Aac as M4a,
  Mp3,
  Flac,
  Ffmpeg,
  Ffmpeg as Wma,
  MakeWave,
  AacAsync,
  AacAsync as M4aAsync,
  Mp3Async,
  FlacAsync,
  FfmpegAsync,
  FfmpegAsync as WmaAsync,
  MakeWaveAsync,
};
