import axios from 'axios'

export const shortenUrl = async (originalUrl: string): Promise<string> => {
  try {
    const encodedUrl = encodeURIComponent(originalUrl)
    const apiUrl = `https://tinyurl.com/api-create.php?url=${encodedUrl}`

    const response = await axios.get(apiUrl, {
      timeout: 5000,
    })

    if (response.status === 200 && response.data && response.data.startsWith('http')) {
      return response.data
    }

    throw new Error('Invalid response from tinyurl API')
  } catch (error) {
    console.error('URL shortening failed, returning original URL:', error)
    return originalUrl
  }
}
