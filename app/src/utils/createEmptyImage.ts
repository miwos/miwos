export const createEmptyImage = () => {
  const image = document.createElement('img')
  image.src =
    'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
  return image
}
