/* eslint-disable @typescript-eslint/no-explicit-any */
export const omitEmptyStringKeys = (
  obj: Record<string, any>
): Record<string, any> =>
  Object.keys(obj).reduce<Record<string, any>>((acc, key) => {
    if (obj[key] !== "") acc[key] = obj[key];
    return acc;
  }, {});
