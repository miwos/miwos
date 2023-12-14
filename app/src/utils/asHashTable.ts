/**
 * If lua sends an object that has consecutive keys starting with 1, it will
 * be parsed as an array. But sometimes that is not what we want. Instead we
 * might want to preserve the original lua hash table with it's one-based
 * indexes.
 * @param value
 * @returns
 */
export const asHashTable = <TKey extends string, TValue>(
  value: TValue[] | Record<TKey, TValue> | undefined,
) => {
  if (value === undefined) return {}
  if (!Array.isArray(value)) return value
  // Convert the array into an object (hash table) using one-based lua indexes.
  return Object.fromEntries(value.map((v, i) => [i + 1, v]))
}
