import * as crypto from 'node:crypto';

export type Key = { iv: Buffer; key: Buffer };
const algorithm = 'aes-256-ctr';

export function MakeKey(text: string): Key {
  const key = crypto
    .createHash('sha256')
    .update(text + '-key-' + text)
    .digest();
  const data = crypto
    .createHash('sha256')
    .update('iv-' + text + '-iv')
    .digest();
  const vals = new Array(16).fill(0);
  for (let i = 0; i < data.length; i++) {
    // eslint-disable-next-line no-bitwise
    vals[i % 16] = vals[i % 16] ^ data[i];
  }
  return { iv: Buffer.from(vals), key };
}

export function Encrypt(key: Key, data: string | Buffer): Buffer {
  const cipher = crypto.createCipheriv(algorithm, key.key, key.iv);
  const encrypted = cipher.update(data);
  return Buffer.concat([encrypted, cipher.final()]);
}

export function Decrypt(key: Key, data: Buffer): Buffer {
  const decipher = crypto.createDecipheriv(algorithm, key.key, key.iv);
  const decrypted = decipher.update(data);
  return Buffer.concat([decrypted, decipher.final()]);
}
