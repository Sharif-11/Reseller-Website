import { apiClient } from './ApiClient'

class ProductApi {
  public async getVariants(productId: number) {
    return apiClient.get(`products/${productId}/variants`)
  }
  public async getProductDetail(productId: number) {
    return apiClient.get(`products/user/${productId}`)
  }
  public async getLatestProducts(page: number = 1, limit: number = 6) {
    return apiClient.get(`products/latest?page=${page}&limit=${limit}`)
  }
  public async getAllProducts({
    search,
    minPrice,
    maxPrice,
    categoryId,
    shopId,
    page,
    limit,
  }: {
    search?: string
    minPrice?: number
    maxPrice?: number
    categoryId?: number | number[]
    shopId?: number
    page?: number
    limit?: number
  }) {
    const params: {
      search?: string
      minPrice?: number
      maxPrice?: number
      categoryId?: number | number[]
      shopId?: number
      page?: number
      limit?: number
    } = {
      search,
      categoryId,
      shopId,
    }
    if (minPrice) params.minPrice = minPrice
    if (maxPrice && maxPrice > 0) params.maxPrice = maxPrice
    if (page) params.page = page
    if (limit) params.limit = limit
    if (search && search.trim() !== '') params.search = search

    return apiClient.get('products/user', {
      params,
    })
  }
}
export const productApi = new ProductApi()
