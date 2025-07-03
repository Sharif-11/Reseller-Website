export interface OrderProduct {
  id: number
  imageUrl: string
  imageId: number
  quantity: number
  sellingPrice: number
  selectedVariants?: {
    [key: string]: string | number
  }
}
export interface OrderData {
  shopId: number
  customerName: string
  customerPhoneNo: string
  customerZilla: string
  customerUpazilla: string
  deliveryAddress: string
  comments?: string
  products: OrderProduct[]
}
export interface OrderProductData {
  id: number
  imageUrl: string
  imageId: number
  quantity: number
  sellingPrice: number
  selectedVariants?: {
    [key: string]: string | number
  }
}
export interface CustomerOrderData {
  shopId: number
  customerName: string
  customerPhoneNo: string
  customerZilla: string
  customerUpazilla: string
  deliveryAddress: string
  products: OrderProductData[]
  comments?: string
}
