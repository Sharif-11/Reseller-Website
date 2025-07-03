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

  public async cancelOrderBySeller({ orderId, reason }: { orderId: number; reason: string }) {
    return apiClient.post('orders/seller/cancel', {
      orderId,
      reason,
    })
  }
  public confirmOrderBySeller(orderId: number) {
    return apiClient.post(`orders/seller/confirm/${orderId}`)
  }
  public async reorderFailedOrder(orderId: number) {
    return apiClient.post(`orders/seller/re-order/${orderId}`)
  }
}

export const orderApi = new OrderApi()
