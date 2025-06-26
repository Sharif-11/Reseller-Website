import { apiClient } from './ApiClient'

class PaymentApi {
  /**
   * Get all payments of a specific user
   * @param userPhoneNo User's phone number
   * @param params Optional query parameters (paymentStatus, page, limit, search)
   */
  public async getPaymentsOfUser(
    userPhoneNo: string,
    params?: {
      paymentStatus?: string
      page?: number
      limit?: number
      search?: string
    }
  ) {
    return apiClient.get(`payments/user/${userPhoneNo}`, { params })
  }

  /**
   * Get all payments (admin view)
   * @param params Optional query parameters (paymentStatus, transactionId, search, page, limit)
   */
  public async getAllPayments(params?: {
    paymentStatus?: string
    transactionId?: string
    search?: string
    page?: number
    limit?: number
  }) {
    return apiClient.get('payments/admin', { params })
  }

  /**
   * Verify a payment (admin only)
   * @param paymentId Payment ID to verify
   * @param transactionId Transaction ID to confirm
   */
  public async verifyPayment(paymentId: string, transactionId: string) {
    return apiClient.post(`payments/admin/verify/${paymentId}`, { transactionId })
  }

  /**
   * Create a new payment
   * @param paymentData Payment creation data
   */
  public async createPayment(paymentData: {
    paymentType: string
    sender: string
    userWalletName: string
    userWalletPhoneNo: string
    systemWalletPhoneNo: string
    amount: number
    transactionId: string
  }) {
    return apiClient.post('payments', paymentData)
  }

  /**
   * Create a withdrawal payment
   * @param withdrawalData Withdrawal payment data
   */
  public async createWithdrawalPayment(withdrawalData: {
    amount: number
    transactionFee: number
    systemWalletPhoneNo: string
    systemWalletName: string
    transactionId: string
    userWalletName: string
    userWalletPhoneNo: string
  }) {
    return apiClient.post('payments/withdraw', withdrawalData)
  }
}

export const paymentApi = new PaymentApi()
