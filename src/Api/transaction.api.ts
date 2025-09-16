import { apiClient } from './ApiClient'

class TransactionApi {
  public async getTransactions({
    page,
    limit,
    search,
  }: {
    page?: number
    limit?: number
    search?: string
  }): Promise<any> {
    return apiClient.get('/transactions', {
      params: {
        page,
        limit,
        search,
      },
    })
  }
  public async getIncomeStatisticsOfAUser(){
    return apiClient.get('/transactions/seller/income')
  }
}
export const transactionApi = new TransactionApi()
