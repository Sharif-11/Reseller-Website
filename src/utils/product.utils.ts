/**
 * Flattens an array of objects with key-values structure into key-value pairs
 * @param {Array<{key: string, values: string[]}>} input - Array of objects with key and values array
 * @returns {Array<{key: string, value: string}>} - Flattened array of key-value pairs
 */
function flattenKeyValues<T extends { key: string; values: string[] }>(
    input: T[]
  ): { key: string; value: string }[] {
    if (!Array.isArray(input)) {
      throw new Error('Input must be an array');
    }
  
    return input.reduce((acc, item) => {
      // Validate item structure
      if (!item || typeof item !== 'object' || !('key' in item) || !('values' in item)) {
        console.warn('Invalid item structure encountered', item);
        return acc;
      }
  
      // Filter out empty values and create pairs
      const pairs = item.values
        .filter(value => value !== undefined && value !== null && value.trim() !== '')
        .map(value => ({
          key: item.key,
          value: value.trim()
        }));
  
      return [...acc, ...pairs];
    }, [] as { key: string; value: string }[]);
  }
  
  // now create a reverse function to convert key-value pairs back to key-values structure

  export function unflattenKeyValues<T extends { key: string; value: string }>(
    input: T[]
  ): { key: string; values: string[] }[] {
    if (!Array.isArray(input)) {
      throw new Error('Input must be an array');
    }
  
    return input.reduce((acc, pair) => {
      // Validate pair structure
      if (!pair || typeof pair !== 'object' || !('key' in pair) || !('value' in pair)) {
        console.warn('Invalid pair structure encountered', pair);
        return acc;
      }
  
      // Find existing key or create a new one
      const keyIndex = acc.findIndex(item => item.key === pair.key);
      if (keyIndex === -1) {
        acc.push({ key: pair.key, values: [pair.value] });
      } else {
        acc[keyIndex].values.push(pair.value);
      }
  
      return acc;
    }, [] as { key: string; values: string[] }[]);
  }

  export default flattenKeyValues;