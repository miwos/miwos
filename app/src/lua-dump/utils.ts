export const asArray = (v: any) => (Array.isArray(v) ? v : [v])

export const indent = (depth: number) => '  '.repeat(depth)

export const center = (str: string, width: number) => {
  if (str.length >= width) return str
  const marginLeft = Math.floor((width - str.length) / 2)
  const marginRight = width - marginLeft - str.length
  return ' '.repeat(marginLeft) + str + ' '.repeat(marginRight)
}

export const crop = (str: string, width: number) => {
  if (str.length <= width) return str
  const hasQuotes = str.startsWith("'") && str.endsWith("'")
  const prepend = hasQuotes ? "…'" : '…'
  return str.slice(0, width - prepend.length) + prepend
}

export const fit = (str: string, width: number) =>
  str.length > width ? crop(str, width) : center(str, width)
