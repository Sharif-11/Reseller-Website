import { apiClient } from './ApiClient'
export type Shop = {
  shopId: number
  shopName: string
  shopLocation: string
  shopIcon: string | null
  deliveryChargeInside: number
  deliveryChargeOutside: number
  shopDescription: string | null
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}
export type ShopCategory = {
  shopId: number
  createdAt: Date
  updatedAt: Date
  categoryId: number
  shopCategoryId: number
}
export type Category = {
  name: string
  createdAt: Date
  updatedAt: Date
  description: string | null
  categoryId: number
  categoryIcon: string | null
  parentId: number | null
}
export type Product = {
  name: string
  productId: number
  categoryId: number
  shopId: number
  description: string
  published: boolean
  videoUrl: string | null
  basePrice: number
  price?: number
  suggestedMaxPrice: number
  createdAt: Date
  updatedAt: Date
  ProductVariant?: Record<string, any>[]
  shop: {
    shopId: number
    shopName: string
    shopLocation: string
    deliveryChargeInside?: number
    deliveryChargeOutside?: number
  }
  ProductImage: [
    {
      imageUrl: string
      imageId: number
    }
  ]
}

class ShopApi {
  public async getAllShops() {
    return apiClient.get('shops')
  }
  public async getShopCategories(shopId: number) {
    return apiClient.get(`shops/${shopId}/categories`)
  }
  public async getCategories(parentId: number | null = null) {
    return apiClient.get('categories/subcategories', {
      params: {
        parentId,
      },
    })
  }
  public async getAllProducts({
    search,
    minPrice,
    maxPrice,
    categoryId,
    shopId,
    page = 1,
    limit = 10,
  }: {
    search?: string
    minPrice?: number
    maxPrice?: number
    categoryId?: number
    shopId?: number
    page?: number
    limit?: number
  }) {
    return apiClient.get('products/user', {
      params: {
        search,
        minPrice,
        maxPrice,
        categoryId,
        shopId,
        page,
        limit,
      },
    })
  }
}
export default new ShopApi()
