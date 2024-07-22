export function ToPathSafeName(name: string): string {
  // I want to produce a name that *looks* close to the original wherever
  // possible, while being encodable on a case-insensitive platform as a file
  // name.
  // Everything starts out in "normal, uppercase" mode
  // An dash is the "control" character
  // A double dash means "flip case mode"
  // Everything else is a B36 encoded UTF8 code
  const res: string[] = [];
  let curCase = /[A-Z0-9_.]/;
  let notCase = /[a-z0-9_.]/;
  for (const c of name) {
    if (curCase.exec(c) !== null) {
      res.push(c.toUpperCase());
    } else if (notCase.exec(c) !== null) {
      res.push('--', c.toUpperCase());
      const tmp = curCase;
      curCase = notCase;
      notCase = tmp;
    } else {
      res.push('-', c.charCodeAt(0).toString(36).toUpperCase(), '-');
    }
  }
  return res.join('');
}

export function FromPathSafeName(safe: string): string {
  // This just undoes what the above function does
  let curCase = (a: string) => a.toUpperCase();
  let notCase = (a: string) => a.toLowerCase();
  const res: string[] = [];
  for (let i = 0; i < safe.length; i++) {
    const c = safe[i];
    // Just a letter, folks
    if (c !== '-') {
      res.push(curCase(c));
      continue;
    }
    // Check to see if we're safe
    const nextUnderscore = safe.indexOf('-', i + 1);
    /* istanbul ignore next */
    if (nextUnderscore < 0) {
      throw Error('Non-terminated encoding.');
    }
    // Is this a case-flip command?
    if (nextUnderscore === i + 1) {
      const tmp = curCase;
      curCase = notCase;
      notCase = tmp;
    } else {
      // Let's make sure that this number is formatted properly
      const numStr = safe.substring(i + 1, nextUnderscore);
      const theMatch = /^[0-9A-Z]+$/.exec(numStr);
      /* istanbul ignore else */
      if (theMatch !== null) {
        res.push(
          String.fromCharCode(Number.parseInt(numStr.toLowerCase(), 36)),
        );
      } else {
        throw Error('Invalid encoding');
      }
    }
    i = nextUnderscore;
  }
  return res.join('');
}

/**
 *
 * @param val - An unsigned integer
 * @returns A string encoding of the value in 4 (or fewer) characters
 */
export function ToU8(val: number): string {
  const res = [];
  /* istanbul ignore next */
  if (val > Number.MAX_SAFE_INTEGER || val < 0 || Math.floor(val) !== val) {
    /* istanbul ignore next */
    throw new Error(`${val} out of range for U8 encoding`);
  }
  do {
    // Run once this for a zero value, so we don't get empty-string
    // All unicode values between 256 and 511 are defined and independent :)
    // Plus, this makes it so that other schemes involved ASCII don't conflict
    res.push((val % 512) + 0x1400);
    val = Math.floor(val / 512);
  } while (val > 0);
  return String.fromCharCode(...res);
}

export function FromU8(val: string): number {
  let res = 0;
  for (let i = val.length - 1; i >= 0; i--) {
    const code = val.charCodeAt(i) - 0x1400;
    /* istanbul ignore next */
    if (code < 0 || code > 0x1ff) {
      throw new Error(`Character ${val[i]} (${code}) out of range`);
    }
    res *= 512;
    res += code;
  }
  return res;
}

export function ToB64(val: number): string {
  const res = [];
  /* istanbul ignore next */
  if (val > Number.MAX_SAFE_INTEGER || val < 0 || Math.floor(val) !== val) {
    throw new Error(`${val} out of range for B64 encoding`);
  }
  do {
    // Run once this for a zero value, so we don't get empty-string
    // All unicode values between 256 and 511 are defined and independent :)
    // Plus, this makes it so that other schemes involved ASCII don't conflict
    const num = val % 64;
    val = Math.floor(val / 64);
    if (num < 26) {
      res.push(num + 65); // "A" = 65
    } else if (num < 52) {
      res.push(num + 71); // "a" = 97; 97 - 26 = 71
    } else if (num < 62) {
      res.push(num - 4); // "0" = 48; 48 - 52 = -4
    } else if (num === 62) {
      res.push(43); // "+" == 43
    } else if (num === 63) {
      res.push(47); // "/" == 47
    }
  } while (val > 0);
  return String.fromCharCode(...res);
}

export function FromB64(val: string): number {
  let res = 0;
  for (let i = val.length - 1; i >= 0; i--) {
    const code = val.charCodeAt(i);
    res *= 64;
    if (code > 64 && code < 91) {
      res += code - 65;
    } else if (code > 96 && code < 123) {
      res += code - 71;
    } else if (code > 47 && code < 58) {
      res += code + 4;
    } else if (code === 43) {
      res += 62;
    } else if (code === 47) {
      res += 63;
    } else {
      /* istanbul ignore next */
      throw new Error(`Character ${val[i]} (${code}) out of range`);
    }
  }
  return res;
}
