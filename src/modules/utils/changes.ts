const isArrayMatch = (e: unknown, c: unknown): boolean => {
  if (e instanceof Array && c instanceof Array) {
    return e.length === c.length && e.every((v, i) => isArrayMatch(v, c[i]));
  } else if (e === c) return true;

  return false;
};

const isDate = (d: Date): boolean => d && typeof d == 'object' && 'getTime' in d;

export const changes = <T extends { [key: string]: any }>(
  existing: T,
  current: T,
): any | Partial<T> =>
  Object.keys(existing)
    .map((key) => {
      // e is existing, c is current
      let e: typeof existing = existing[key],
        c: typeof current = current[key],
        // u = unique for things like arrays
        u = false;

      if (typeof e === 'object' && !(e instanceof Array) && !!e && !isDate(e)) {
        const change = changes(e, c);
        return Object.entries(change).length > 0 ? [key, change] : null;
      }

      // If date compare getTime since Date != Date
      if (isDate(existing[key])) e = existing[key].getTime();
      if (isDate(current[key])) c = current[key].getTime();

      u = isArrayMatch(e, c);

      return u || e == c
        ? null
        : ([key, current[key]] as [keyof T, T[keyof T]]);
    })
    .filter((is) => !!is)
    .reduce(
      (acc, [key, val]: any) => ({
        ...acc,
        [key]: val,
      }),
      {},
    );