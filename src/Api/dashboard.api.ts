import { apiClient } from './ApiClient'

class DashboardApi {
  public async getDashboardData(): Promise<any> {
    return apiClient.get('/dashboard/seller')
  }
}
export const dashboardApiService = new DashboardApi()
