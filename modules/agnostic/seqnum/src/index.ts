/**
 * A function that generates sequence numbers (strings)
 * plus has a `cmp` key-comparison function (for sorting)
 */
export type SeqNumGenerator = {
  (): string;
  cmp: (a: string, b: string) => number;
};

/**
 * Create a sequence number generator: Something that produces unique numbers
 * that you can use for all sorts of random things...
 * @example
 * `const generator = require('@freik/seqnum')('PFX');`
 * `const newNumber = generator();`
 * `const anotherNumber = generator();`
 * `if (newNumber === anotherNumber) throw new Error("Never happens. Ever");`
 *
 * @param prefix The string to prepend to the sequence number generated
 * @param resume The 'last' sequence number generated (including any prefix!)
 * @returns A {@link SeqNumGenerator} to produce sequence numbers as it's called
 */
export default function MakeSeqNum(
  prefix?: string,
  resume?: string,
): SeqNumGenerator {
  const pref = prefix || '';
  const pl = pref.length;
  let curId = 0;
  if (resume) {
    curId = parseInt(resume.substring(pl), 36);
    curId++;
  }
  const theFunc = () => pref + (curId++).toString(36);
  theFunc.cmp = (a: string, b: string): number => {
    const aPref = a.substring(0, pl);
    const bPref = b.substring(0, pl);
    if (aPref !== bPref) {
      return NaN;
    }
    const aVal = parseInt(a.substring(pl), 36);
    const bVal = parseInt(b.substring(pl), 36);
    return aVal - bVal;
  };
  return theFunc;
}
