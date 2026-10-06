/** Make imported company names consistent without changing intentional brand casing. */
export const formatCompanyName = (value: string) =>
  value.trim().replace(/(^|[\s-])([a-z])/g, (_match, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`);
