export interface Product {
    productId: number;
    name: string;
    imageUrl: string;
    basePrice: number;
    stockSize: number;
    suggestedMaxPrice: number;
    description: string;
    videoUrl: string;
    isVerifiedProduct: boolean;
    images: { imageId: number; imageUrl: string }[];
    metas: { key: string; value: string }[];
  }
  export interface FavoriteProduct {
    productId: number;
    name: string;
    imageUrl: string;
    basePrice: number;
  }
  
 