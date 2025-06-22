import { apiClient } from './ApiClient'

class ProductApi {
  public async getVariants(productId: number) {
    return apiClient.get(`products/${productId}/variants`)
  }
  public async getProductDetailForSeller(productId: number) {
    return apiClient.get(`products/seller/${productId}`)
  }
}
export const productApi = new ProductApi()
