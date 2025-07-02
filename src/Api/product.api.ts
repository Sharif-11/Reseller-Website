import { apiClient } from './ApiClient'

class ProductApi {
  public async getVariants(productId: number) {
    return apiClient.get(`products/${productId}/variants`)
  }
  public async getProductDetail(productId: number) {
    return apiClient.get(`products/user/${productId}`)
  }
}
export const productApi = new ProductApi()
