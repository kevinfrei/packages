import {
  Attributes,
  FullMetadata,
  Metadata as oldMetadata,
  SimpleMetadata,
} from '@freik/media-core';
import type { SimpleObject, typecheck } from '@freik/typechk';

import * as _Covers from './cover.js';
import * as _Cue from './cue.js';
import * as _Decode from './decode.js';
import * as _Encode from './encode.js';
import * as newMetadata from './metadata.js';

const Covers = _Covers;
const Decode = _Decode;
const Encode = _Encode;
const Cue = _Cue;
export { Covers, Decode, Encode, Cue };

// A function type for decoding audio
export type Decoder = (inputFile: string, outputFile: string) => boolean;

// Ditto, async
export type DecoderAsync = (
  inputFile: string,
  outputFile: string,
) => Promise<boolean>;

// A function type for encoding audio
export type Encoder = (
  wavFile: string,
  outputFilename: string,
  options?: Attributes,
  attrs?: Attributes,
  coverImage?: string,
) => boolean;

// Ditto, async
export type EncoderAsync = (
  wavFile: string,
  outputFilename: string,
  options?: Attributes,
  attrs?: Attributes | SimpleMetadata,
  coverImage?: string,
) => Promise<boolean>;

type MetadataType = {
  FromFileAsync: (pathname: string) => Promise<SimpleMetadata | void>;
  RawMetadata: (pathname: string) => Promise<SimpleObject>;
  isSimpleMetadata: typecheck<SimpleMetadata>;
  AddPattern: (rgx: RegExp, compilation?: 'ost' | 'va') => void;
  FromPath: (pthnm: string) => SimpleMetadata | void;
  SplitArtistString: (artists: string) => string[];
  FullFromObj: (file: string, data: Attributes) => FullMetadata | void;
};

export const Metadata: MetadataType = { ...newMetadata, ...oldMetadata };
