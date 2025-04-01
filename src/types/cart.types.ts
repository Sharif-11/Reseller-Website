export interface CartItem {
  cartItemId: string; // Unique cart item ID
  productId: number;
  name: string;
  basePrice: number;
  sellingPrice: number;
  quantity: number;
  imageUrl: string;
  selectedOptions: Record<string, string>;
}