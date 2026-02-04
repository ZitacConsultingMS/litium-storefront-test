export function camelize(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}
export function localeSensitiveCompare(
  str1: string,
  str2: string,
  locale: string
) {
  return str1.localeCompare(str2, locale, { sensitivity: 'accent' });
}
