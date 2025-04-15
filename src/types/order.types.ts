export interface OrderProduct {
    productId: number;
    productImage: string;
    productQuantity: number;
    productSellingPrice: number;
    selectedOptions?: {
      [key: string]: string | number; 
    };
  };
export interface OrderData  {
    customerName: string;
    customerPhoneNo: string;
    customerZilla: string;
    customerUpazilla: string;
    deliveryAddress: string;
    comments?: string;
    products: OrderProduct[];
    isDeliveryChargePaidBySeller: boolean;
    deliveryChargePaidBySeller?: number;
    transactionId: string;
    sellerWalletName: string;
    sellerWalletPhoneNo: string;
    adminWalletId: number;
  };