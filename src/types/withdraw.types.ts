export interface WithdrawalDetails {
    amount: number;
    actualAmount: number;
    transactionFee: number;
    walletName: 'bKash' | 'Nagad';
    walletPhoneNo: string;
  }
  
export interface FeeConfig {
    minWithdrawAmount: number;
    smallAmountThreshold: number;
    smallAmountFee: number;
    largeAmountFee: number;
    largeAmountFeePerThousand?: number; // Only for Nagad
  }

 export  const WALLET_CONFIG: Record<'bKash' | 'Nagad', FeeConfig> = {
    bKash: {
      minWithdrawAmount: 50,
      smallAmountThreshold: 1000,
      smallAmountFee: 5,
      largeAmountFee: 10,
    },
    Nagad: {
      minWithdrawAmount: 50,
      smallAmountThreshold: 1000,
      smallAmountFee: 5,
      largeAmountFee: 10,
      largeAmountFeePerThousand: 5, // 5 TK per 1000 TK
    },
  };
  