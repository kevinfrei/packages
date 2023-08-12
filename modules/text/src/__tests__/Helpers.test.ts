import {
  NormalizeText,
  StripInitialArticles,
  NoArticlesNormalizedStringCompare,
  NoArticlesStringCompare,
  NormalizedStringCompare,
  StringCompare,
} from '../index';

test('Text Helpers', () => {
  expect(StripInitialArticles('The rain')).toEqual('rain');
  expect(NormalizeText('’“”‐')).toEqual('\'""-');
  expect(StringCompare('A', 'B')).toEqual(-1);
  expect(StringCompare('B', 'A')).toEqual(1);
  expect(StringCompare('B', 'B')).toEqual(0);
  expect(
    NormalizedStringCompare('BLUE ÖYSTER CULT', 'BLUE ÖYSTER CULT'),
  ).toEqual(0);
  expect(
    NoArticlesNormalizedStringCompare(
      'The BLUE ÖYSTER CULT',
      'A BLUE ÖYSTER CULT',
    ),
  ).toEqual(0);
  expect(NoArticlesStringCompare('The test', 'a test')).toEqual(0);
});
