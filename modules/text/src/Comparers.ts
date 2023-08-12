import { NormalizeText, StripInitialArticles } from './Cleaners.js';

// Gotta use this instead of localeCompare, thanks to
// BLUE ÖYSTER CULT and BLUE ÖYSTER CULT being locale equal, but not ===
// which causes problems in the ArtistMap of the Music database
export function StringCompare(a: string, b: string): number {
  return (a > b ? 1 : 0) - (a < b ? 1 : 0);
}

export function NormalizedStringCompare(a: string, b: string): number {
  return StringCompare(NormalizeText(a), NormalizeText(b));
}

export function NoArticlesNormalizedStringCompare(
  a: string,
  b: string,
): number {
  return StringCompare(
    StripInitialArticles(NormalizeText(a)),
    StripInitialArticles(NormalizeText(b)),
  );
}

export function NoArticlesStringCompare(a: string, b: string): number {
  return StringCompare(StripInitialArticles(a), StripInitialArticles(b));
}
