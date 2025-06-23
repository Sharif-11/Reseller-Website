import { apiClient } from './ApiClient'

class WalletApi {
  public async getWalletsOfASeller(phoneNo: string): Promise<any> {
    return apiClient.get(`wallets/seller/${phoneNo}`)
  }
  public async createWalletForSeller({
    walletName,
    walletPhoneNo,
  }: {
    walletName: string
    walletPhoneNo: string
  }) {
    return apiClient.post(`wallets`, {
      walletName,
      walletPhoneNo,
    })
  }
  public async sendOtpToWallet({ walletPhoneNo }: { walletPhoneNo: string }) {
    return apiClient.post(`wallets/send-otp`, { walletPhoneNo })
  }
  public async verifyOtpForWallet({ walletPhoneNo, otp }: { walletPhoneNo: string; otp: string }) {
    return apiClient.post(`wallets/verify-otp`, {
      walletPhoneNo,
      otp,
    })
  }
}
export const walletApi = new WalletApi()
