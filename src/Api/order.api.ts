import { CustomerOrderData, OrderData } from '../types/order.types'
import { apiClient } from './ApiClient'

class OrderApi {
  public async createSellerOrder(data: OrderData) {
    return apiClient.post('orders/seller', data)
  }
  public async createCustomerOrder(data: CustomerOrderData) {
    return apiClient.post('orders/customer', data)
  }

  public async getSellerOrders({
    page = 1,
    limit = 10,
    search,
    orderStatus,
  }: {
    page?: number
    limit?: number
    search?: string
    orderStatus?: string | string[]
  }) {
    return apiClient.get('orders/seller', {
      params: {
        page,
        limit,
        search,
        orderStatus,
      },
    })
  }
  public async getAllReferredOrdersForASeller({
    page = 1,
    limit = 10,
  }: {
    page?: number
    limit?: number
  }) {
    return apiClient.get('orders/seller/referral', {
      params: {
        page,
        limit,
      },
    })
  }
  public async getAllCustomerOrdersForASeller({
    page = 1,
    limit = 10,
    search,
  }: {
    page?: number
    limit?: number
    search?: string
  }) {
    return apiClient.get('orders/seller/customer-referral', {
      params: {
        page,
        limit,
        search,
      },
    })
  }
  public async getCustomerOrders({
    phoneNo,
    page = 1,
    limit = 10,
    search,
    orderStatus,
  }: {
    phoneNo: string
    page?: number
    limit?: number
    search?: string
    orderStatus?: string | string[]
  }) {
    return apiClient.get('orders/customer', {
      params: {
        page,
        limit,
        search,
        orderStatus,
        phoneNo,
      },
    })
  }

  public async orderPaymentBySeller({
    orderId,
    paymentMethod,
    sellerWalletName,
    sellerWalletPhoneNo,
    systemWalletPhoneNo,
    amount,
    transactionId,
  }: {
    orderId: number
    paymentMethod: 'WALLET' | 'BALANCE'
    sellerWalletName?: string
    sellerWalletPhoneNo?: string
    systemWalletPhoneNo?: string
    amount?: number
    transactionId?: string
  }) {
    return apiClient.post('orders/seller/payment', {
      orderId,
      paymentMethod,
      sellerWalletName,
      sellerWalletPhoneNo,
      systemWalletPhoneNo,
      amount,
      transactionId,
    })
  }
  public async orderPaymentByCustomer({
    orderId,
    customerWalletPhoneNo,
    systemWalletPhoneNo,
    amount,
    transactionId,
    customerWalletName,
  }: {
    orderId: number
    customerWalletPhoneNo: string
    systemWalletPhoneNo: string
    amount: number
    transactionId: string
    customerWalletName: string
  }) {
    return apiClient.post('orders/customer/payment', {
      orderId,
      customerWalletPhoneNo,
      systemWalletPhoneNo,
      amount,
      transactionId,
      customerWalletName,
    })
  }

  public async cancelOrderBySeller({ orderId, reason }: { orderId: number; reason: string }) {
    return apiClient.post('orders/seller/cancel', {
      orderId,
      reason,
    })
  }
  public async cancelOrderByCustomer({
    orderId,
    reason,
    phoneNo,
  }: {
    orderId: number
    reason: string
    phoneNo: string
  }) {
    return apiClient.post('orders/customer/cancel', {
      orderId,
      reason,
      phoneNo,
    })
  }
  public confirmOrderBySeller(orderId: number) {
    return apiClient.post(`orders/seller/confirm/${orderId}`)
  }
  public async reorderFailedOrderBySeller(orderId: number) {
    return apiClient.post(`orders/seller/re-order/${orderId}`)
  }
  public async reorderFailedOrderByCustomer({
    orderId,
    phoneNo,
  }: {
    orderId: number
    phoneNo: string
  }) {
    return apiClient.post(`orders/customer/re-order/${orderId}`, { phoneNo })
  }
  public async fraudCheckByPhoneNo(phoneNo: string) {
    return apiClient.get(`orders/fraud-check/${phoneNo}`)
  }
  public async getTopSellingProducts(page: number = 1, limit: number = 10) {
    return apiClient.get(`orders/top-selling-products?page=${page}&limit=${limit}`)
  }
}

export const orderApi = new OrderApi()
