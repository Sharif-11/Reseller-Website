import axiosInstance from '../Axios/axiosInstance'

/**
 * Fetches the complete commission table
 */
export const getCommissionTable = async (admin: boolean = false) => {
  try {
    const { data } = await axiosInstance.get(`${admin ? 'admin' : ''}commissions/table`)
    return {
      success: data.success,
      message: data.message,
      data: data.data,
      statusCode: data.statusCode,
    }
  } catch (error: any) {
    return {
      success: error.response?.data?.success || false,
      message: error.response?.data?.message || 'Failed to fetch commission table',
      data: error.response?.data?.data || null,
      statusCode: error.response?.status || 500,
    }
  }
}

/**
 * Completely replaces the commission table
 */
export const replaceCommissionTable = async (
  tableData: {
    startPrice: number
    endPrice: number | null
    amounts: number[]
  }[]
) => {
  try {
    const { data } = await axiosInstance.put('admin/commissions', { data: tableData })
    return {
      success: data.success,
      message: data.message,
      data: data.data,
      statusCode: data.statusCode,
    }
  } catch (error: any) {
    return {
      success: error.response?.data?.success || false,
      message: error.response?.data?.message || 'Failed to update commission table',
      data: error.response?.data?.data || null,
      statusCode: error.response?.status || 500,
    }
  }
}

/**
 * Gets commission rates for a specific price point
 */
export const getCommissionsForPrice = async (price: number) => {
  try {
    const { data } = await axiosInstance.get(`commissions/calculations/${price}`)
    return {
      success: data.success,
      message: data.message,
      data: data.data,
      statusCode: data.statusCode,
    }
  } catch (error: any) {
    return {
      success: error.response?.data?.success || false,
      message: error.response?.data?.message || `Failed to get commissions for price ${price}`,
      data: error.response?.data?.data || null,
      statusCode: error.response?.status || 500,
    }
  }
}

/**
 * Calculates commission distribution for a user purchase
 */
export const calculateUserCommissions = async (phoneNo: string, price: number) => {
  try {
    const { data } = await axiosInstance.post('commissions/calculations', { phoneNo, price })
    return {
      success: data.success,
      message: data.message,
      data: data.data,
      statusCode: data.statusCode,
    }
  } catch (error: any) {
    return {
      success: error.response?.data?.success || false,
      message: error.response?.data?.message || 'Failed to calculate commissions',
      data: error.response?.data?.data || null,
      statusCode: error.response?.status || 500,
    }
  }
}
