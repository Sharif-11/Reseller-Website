import { AxiosInstance } from 'axios'
import axiosInstance from '../Axios/axiosInstance'
import { ApiResponse, apiClient } from './ApiClient'

interface DownloadOptions {
  baseNamePrefix?: string
  delayBetweenDownloads?: number
  responseType?: 'blob' | 'arraybuffer' | 'stream'
  headers?: Record<string, string>
  onProgress?: (progress: number) => void // Optional progress callback
}
export interface UploadResponse {
  filePath: string
  fileName: string
  originalName: string
  size: number
  mimeType: string
  publicUrl: string
  uploadedAt: Date
}

export interface UploadOptions {
  onUploadProgress?: (progressEvent: ProgressEvent) => void
  fieldName?: string
  additionalData?: Record<string, any>
}

class FileDownloader {
  constructor(private axiosInstance: AxiosInstance) {}

  /**
   * Download a single file
   * @param fileUrl - URL of the file to download
   * @param options - Download options
   */
  public async downloadFile(fileUrl: string, options: DownloadOptions = {}): Promise<void> {
    const {
      baseNamePrefix = 'file',
      responseType = 'blob',
      headers = { Accept: 'application/octet-stream' },
      onProgress,
    } = options

    try {
      const response = await this.axiosInstance.post(
        '/ftp/download',
        { url: fileUrl },
        {
          responseType,
          headers,
          onDownloadProgress: onProgress
            ? progressEvent => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / (progressEvent.total || 1)
                )
                onProgress(percentCompleted)
              }
            : undefined,
        }
      )

      const contentDisposition = response.headers['content-disposition']
      const suggestedName =
        contentDisposition?.split('filename=')[1]?.replace(/"/g, '') ||
        `${baseNamePrefix.replace(/\s+/g, '_')}.jpg`

      this.triggerBrowserDownload(response.data, suggestedName)
    } catch (error) {
      console.error('File download failed:', error)
      throw error
    }
  }

  /**
   * Download multiple files with delay between downloads
   * @param fileUrls - Array of file URLs to download
   * @param options - Download options
   */
  public async downloadAllFiles(
    fileUrls: string[],
    options: DownloadOptions = {}
  ): Promise<{ success: number; failures: number }> {
    const { baseNamePrefix = 'file', delayBetweenDownloads = 300 } = options

    let successCount = 0
    let failureCount = 0

    for (const [index, url] of fileUrls.entries()) {
      try {
        await this.downloadFile(url, {
          ...options,
          baseNamePrefix: `${baseNamePrefix}_${index + 1}`,
        })
        successCount++
      } catch (error) {
        console.warn(`Failed to download file ${index + 1}:`, error)
        failureCount++
      }

      if (index < fileUrls.length - 1 && delayBetweenDownloads > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenDownloads))
      }
    }

    return { success: successCount, failures: failureCount }
  }

  /**
   * Trigger browser download from blob data
   * @param data - File data (blob)
   * @param filename - Suggested filename
   */
  private triggerBrowserDownload(data: BlobPart, filename: string): void {
    const blob = new Blob([data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    }, 100)
  }
  async uploadFile(file: File, options: UploadOptions = {}): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData()
    const fieldName = 'image'

    formData.append(fieldName, file)

    // Append additional data if provided
    if (options.additionalData) {
      Object.entries(options.additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value)
      })
    }

    return apiClient.uploadFile<UploadResponse>('ftp/upload', formData)
  }

  /**
   * Upload multiple files sequentially using the single file endpoint
   * @param files Array of files to upload
   * @param options Upload options including progress callback and additional data
   * @returns Promise with array of upload responses
   */
  async uploadMultipleFiles(
    files: File[],
    options: UploadOptions = {}
  ): Promise<ApiResponse<UploadResponse[]>> {
    const results: UploadResponse[] = []

    for (const file of files) {
      const response = await this.uploadFile(file, options)

      if (!response.success) {
        // Return the failed response if any upload fails
        return {
          ...response,
          data: undefined,
          error: response.error || `Failed to upload ${file.name}`,
        }
      }

      if (response.data) {
        results.push(response.data)
      }
    }

    return {
      success: true,
      data: results,
      statusCode: 200,
    }
  }

  /**
   * Delete a file from the FTP server
   * @param filePath The path of the file to delete
   * @returns Promise with deletion result
   */
  async deleteFile(filePath: string): Promise<ApiResponse<void>> {
    return apiClient.delete('ftp/delete', {
      data: { filePath },
    })
  }
}

// Usage with your existing axiosInstance
const fileDownloader = new FileDownloader(axiosInstance)
export { fileDownloader }

// Download multiple files with progress tracking
// const result = await fileDownloader.downloadAllFiles(imageUrls, {
//   baseNamePrefix: 'product_images',
//   delayBetweenDownloads: 500,
//   onProgress: progress => {
//     console.log(`Download progress: ${progress}%`)
//     // Update your UI here
//   },
// })

// console.log(`Download complete. ${result.success} succeeded, ${result.failures} failed.`)
