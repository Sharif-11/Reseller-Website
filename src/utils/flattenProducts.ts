// Type definitions

import { Product } from '../Api/shop.api'

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface FlattenedResult {
  data: Product[]
  pagination: Pagination
}

/**
 * Flattens products by creating individual entries for each product image
 * If a product has multiple images, it becomes multiple individual products
 *
 * @param products - Array of products
 * @param pagination - Original pagination object
 * @param options - Optional configuration
 * @returns Object containing flattened products and updated pagination
 */
export function flattenProductsByImage(
  products: Product[],
  pagination?: Pagination
): FlattenedResult {
  const flattenedProducts: Product[] = []

  // Process each product
  products.forEach(product => {
    const { ProductImage, ...productWithoutImages } = product

    // If product has no images, add it as is with empty image

    // If product has images, create a separate entry for each image

    ProductImage.forEach(image => {
      flattenedProducts.push({
        ...productWithoutImages,
        ProductImage: [image],
      })
    })
  })

  // Update pagination to reflect flattened count
  if (pagination) {
    const updatedPagination: Pagination = {
      ...pagination,
      total: flattenedProducts.length,
      totalPages: Math.ceil(flattenedProducts.length / pagination.limit),
    }

    return {
      data: flattenedProducts,
      pagination: updatedPagination,
    }
  }
  return {
    data: flattenedProducts,
    pagination: {
      page: 1,
      limit: flattenedProducts.length,
      total: flattenedProducts.length,
      totalPages: 1,
    },
  }
}

// Alternative version that matches your exact original API response format

// Usage example matching your original format
// const products: Product[] = [
//   // Your products array from the API response
// ]

// const originalPagination: Pagination = {
//   page: 1,
//   limit: 20,
//   total: 4, // Original count from your example
//   totalPages: 1,
// }

// Using the function
// const result = flattenProductsByImage(products, originalPagination)
// // OR
// const result2 = flattenProductsFromApiResponse(products, originalPagination)
