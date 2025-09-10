import { apiClient } from './ApiClient'

export interface Customer {
  customerId: string
  customerName: string | null
  customerPhoneNo: string
  role: string
  balance: string
  sellerId: string
  sellerCode: string
  sellerName: string
  sellerPhone: string
  createdAt: string
  updatedAt: string
}

export interface Seller {
  userId: string
  name: string
  phoneNo: string
  zilla: string | null
  upazilla: string | null
  address: string | null
  level: number
  createdAt: string
}

export interface ReferredSellersResponse {
  sellers: Seller[]
  totalCount: number
  totalPages: number
  currentPage: number
}

class UserApi {
  public async getCustomerByPhoneNumber(phoneNumber: string) {
    return apiClient.get<Customer>(`auth/customers/${phoneNumber}`)
  }

  public async getReferredSellersByLevel({
    level,
    page = 1,
    limit = 10,
    search = '',
  }: {
    level: number
    page?: number
    limit?: number
    search?: string
  }) {
    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('limit', limit.toString())
    queryParams.append('level', level.toString())
    if (search) queryParams.append('search', search)

    return apiClient.get<ReferredSellersResponse>(`auth/referred-users?${queryParams.toString()}`)
  }
}

export const userApi = new UserApi()
