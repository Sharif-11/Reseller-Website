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
class UserApi {
  public async getCustomerByPhoneNumber(phoneNumber: string) {
    return apiClient.get<Customer>(`auth/customers/${phoneNumber}`)
  }
}
export const userApi = new UserApi()
