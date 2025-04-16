/* eslint-disable @typescript-eslint/no-explicit-any */
export const omitEmptyStringKeys = (
  obj: Record<string, any>
): Record<string, any> =>
  Object.keys(obj).reduce<Record<string, any>>((acc, key) => {
    if (obj[key] !== "") acc[key] = obj[key];
    return acc;
  }, {});


 export  function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
    const result: Partial<T> = {};
    
    for (const key in obj) {
      if (obj[key] !== undefined) {
        result[key] = obj[key];
      }
    }
    
    return result;
  }

