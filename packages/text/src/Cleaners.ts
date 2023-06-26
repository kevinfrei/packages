const cleaners: [RegExp, string][] = [
  [/[`’‘]/g, "'"],
  [/[“”]/g, '"'],
  [/[\u0300-\u036f]/g, ''], // This kills diacriticals after .normalize()
  [/‐/g, '-'],
];

const articles: [RegExp, string][] = [
  [/^THE /i, ''],
  [/^A /i, ''],
  [/^AN /i, ''],
];

export function StripInitialArticles(phrase: string): string {
  let res = phrase.normalize();
  for (const [rg, str] of articles) {
    res = res.replace(rg, str);
  }
  return res;
}

export function NormalizeText(phrase: string): string {
  let res = phrase.toLocaleUpperCase().normalize();
  for (const [rg, str] of cleaners) {
    res = res.replace(rg, str);
  }
  return res;
}
