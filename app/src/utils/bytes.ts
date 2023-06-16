export const unpackBytes = (packed: number) => [
  packed & 0xff,
  (packed >> 8) & 0xff,
  (packed >> 16) & 0xff,
  (packed >> 24) & 0xff,
]
