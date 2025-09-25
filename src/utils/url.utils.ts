function isValidUrl(urlString: string): boolean {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', // fragment locator
    'i'
  )
  return pattern.test(urlString)
}
const formatUrl = (url: string) => {
  if (!url) return ''

  // If URL already has protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // If URL starts with www, add https://
  if (url.startsWith('www.')) {
    return `https://${url}`
  }

  // For other cases, add https://
  return `https://${url}`
}

export { formatUrl, isValidUrl }
