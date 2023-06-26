import SeqNum from '../index';

test('SeqNum Features', () => {
  const sn = SeqNum('1@#$');
  const myNum = sn();
  expect(myNum).toHaveLength(5);
  expect(myNum.substr(0, 4)).toEqual('1@#$');
  const nutherNum = sn();
  expect(sn.cmp(myNum, nutherNum)).toBeLessThan(0);
  expect(sn.cmp(nutherNum, myNum)).toBeGreaterThan(0);
  expect(sn.cmp(myNum, myNum)).toEqual(0);
  const moreSn = SeqNum('1@#$', nutherNum);
  const lastNum = moreSn();
  expect(sn.cmp(lastNum, nutherNum)).toBeGreaterThan(0);
  expect(sn.cmp(nutherNum, lastNum)).toBeLessThan(0);
  const newSn = SeqNum();
  expect(sn.cmp(newSn(), myNum)).toBeNaN();
});
