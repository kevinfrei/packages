import * as crypto from 'node:crypto';

export type Key = { iv: Uint8Array; key: Uint8Array };
const algorithm = 'aes-256-gcm';

export function MakeKey(text: string): Key {
  const key = crypto
    .createHash('sha256')
    .update(text + '-key-' + text)
    .digest() as Uint8Array<ArrayBufferLike>;
  const data = crypto
    .createHash('sha256')
    .update('iv-' + text + '-iv')
    .digest();
  const vals = new Uint8Array(16).fill(0);
  for (let i = 0; i < data.length; i++) {
    vals[i % 16] = vals[i % 16] ^ data[i];
  }
  return { iv: vals, key };
}

export function Encrypt(
  key: Key,
  data: string | Uint8Array<ArrayBufferLike>,
): Uint8Array<ArrayBufferLike> {
  const cipher = crypto.createCipheriv(algorithm, key.key, key.iv);
  const encrypted = cipher.update(data) as Uint8Array<ArrayBufferLike>;
  return Buffer.concat([
    encrypted,
    cipher.final() as Uint8Array<ArrayBufferLike>,
  ]) as Uint8Array<ArrayBufferLike>;
}

export function Decrypt(
  key: Key,
  data: Uint8Array<ArrayBufferLike>,
): Uint8Array<ArrayBufferLike> {
  const decipher = crypto.createDecipheriv(algorithm, key.key, key.iv);
  const decrypted = decipher.update(data) as Uint8Array<ArrayBufferLike>;
  return Buffer.concat([
    decrypted,
    decipher.final() as Uint8Array<ArrayBufferLike>,
  ]) as Uint8Array<ArrayBufferLike>;
}
