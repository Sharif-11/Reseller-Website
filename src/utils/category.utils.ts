interface Category {
  categoryId: number
  name: string
  categoryIcon: string | null
  description: string
  parentId: number | null
  createdAt?: string
  updatedAt?: string
  products?: number
  subCategories?: SubCategory[]
}

interface SubCategory extends Omit<Category, 'subCategories'> {
  parentId: number
  products: number
}

export function mergeAndFilterCategories(
  categoriesWithSubcategories: Category[],
  allCategories: Category[]
): Category[] {
  // Create a Set of all category IDs from the second API response for quick lookup
  const validCategoryIds = new Set(allCategories.map(cat => cat.categoryId))

  // Process the categories with subcategories
  return categoriesWithSubcategories.map(category => {
    // Filter subcategories to only include those present in the allCategories list
    const filteredSubCategories = (category.subCategories || [])
      .filter(subCat => validCategoryIds.has(subCat.categoryId))
      .map(({ createdAt, updatedAt, ...rest }) => rest) // Remove metadata fields

    // Calculate new product count based on filtered subcategories
    const filteredProductCount = filteredSubCategories.reduce(
      (sum, subCat) => sum + (subCat.products || 0),
      0
    )

    // Remove metadata fields from main category and return
    const { createdAt, updatedAt, ...restCategory } = category

    return {
      ...restCategory,
      subCategories: filteredSubCategories,
      products: filteredProductCount,
    }
  })
}
