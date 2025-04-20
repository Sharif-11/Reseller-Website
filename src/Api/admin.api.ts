import { AxiosError } from "axios";
import axiosInstance from "../Axios/axiosInstance";

export const getAllWithdrawRequestForAdmin = async ({
  status,
  page = 1,
  pageSize = 10
}: {
  status?: 'pending' | 'completed' | 'rejected';
  page?: number;
  pageSize?: number;
}) => {
try {
  const { data } = await axiosInstance.get(`admin/withdraw`, {
    params: {
      status,
      page,
      pageSize
    },
  });

  const { success, message, statusCode } = data;
  const responseData = data?.data;
  return {
    success,
    message,
    data: responseData,
    statusCode,
  };
} catch (error) {
  if (error instanceof AxiosError && error.response?.data) {
    const { data } = error.response;
    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      statusCode,
      data: responseData,
    };
  }
  // Handle unexpected errors
  return {
    success: false,
    message: "An unexpected error occurred",
    statusCode: 500,
    data: null,
  };
}
}
export const approveWithdrawRequestForAdmin = async ({
    id,
    transactionId,
    transactionPhoneNo,
    remarks
  }: {
    id: string;
    transactionId: string;
    transactionPhoneNo?: string;
    remarks?: string;
}) => {
  
  try {
    const { data } = await axiosInstance.patch(`admin/withdraw/${id}/complete`,{

        transactionId,
        transactionPhoneNo: transactionPhoneNo ?? undefined,
        remarks
    });
    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const { data } = error.response;
      const { success, message, statusCode } = data;
      const responseData = data?.data;
      return {
        success,
        message,
        statusCode,
        data: responseData,
      };
    }
    // Handle unexpected errors
    return {
      success: false,
      message: "An unexpected error occurred",
      statusCode: 500,
      data: null,
    };
  }
}

export const rejectWithdrawRequestForAdmin = async ({id,remarks}:{
    id: string;
    remarks: string;
}) => {
  try {
    const { data } = await axiosInstance.patch(`admin/withdraw/${id}/reject`,{
        remarks
    });
    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const { data } = error.response;
      const { success, message, statusCode } = data;
      const responseData = data?.data;
      return {
        success,
        message,
        statusCode,
        data: responseData,
      };
    }
    // Handle unexpected errors
    return {
      success: false,
      message: "An unexpected error occurred",
      statusCode: 500,
      data: null,
    };
  }
}
export const getAllTransactionHistoryForAdmin = async ({
  phoneNo,
  page = 1,
  pageSize = 10,
}: {
  phoneNo?: string;
  page?: number;
  pageSize?: number;
}) => {
  try {
    const { data } = await axiosInstance.get(`admin/transactions`, {
      params: {
        phoneNo,
        page,
        pageSize,
      },
    });

    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const { data } = error.response;
      const { success, message, statusCode } = data;
      const responseData = data?.data;
      return {
        success,
        message,
        statusCode,
        data: responseData,
      };
    }
    // Handle unexpected errors
    return {
      success: false,
      message: "An unexpected error occurred",
      statusCode: 500,
      data: null,
    };
  }
}
export const addAdminWallet = async ({
  walletName,
  walletPhoneNo
} :{
  walletName:string;
  walletPhoneNo:string;
})=>{
  
  try {
    
    const { data } = await axiosInstance.post(`admin/wallets`, {
      walletName,
      walletPhoneNo
    });
    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
  } catch (error) {
    
    if (error instanceof AxiosError && error.response?.data) {
      const { data } = error.response;
      const { success, message, statusCode } = data;
      const responseData = data?.data;
      return {
        success,
        message,
        statusCode,
        data: responseData,
      };
    }
    // Handle unexpected errors
    return {
      success: false,
      message: "An unexpected error occurred",
      statusCode: 500,
      data: null,
    };
  }
}
export const deleteAdminWallet = async ({
  walletId}:{
  walletId:number;
})=>{
  try {
    
    const { data } = await axiosInstance.delete(`admin/wallets/${walletId}`);
    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const { data } = error.response;
      const { success, message, statusCode } = data;
      const responseData = data?.data;
      return {
        success,
        message,
        statusCode,
        data: responseData,
      };
    }
    // Handle unexpected errors
    return {
      success: false,
      message: "An unexpected error occurred",
      statusCode: 500,
      data: null,
    };
    
  }
}
export const getAllAdminWallets = async ()=>{
  
  try {
    
    const { data } = await axiosInstance.get(`admin/wallets`);
    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };


  } catch (error) {
    
    if (error instanceof AxiosError && error.response?.data) {
      const { data } = error.response;
      const { success, message, statusCode } = data;
      const responseData = data?.data;
      return {
        success,
        message,
        statusCode,
        data: responseData,
      };
    }
    // Handle unexpected errors
    return {
      success: false,
      message: "An unexpected error occurred",
      statusCode: 500,
      data: null,
    };
  }

}
export const getAdminOrders=async ({
  page = 1,
  pageSize = 10,
  status
}: {
  page?: number;
  pageSize?: number;
  status?: string;
})=>{
  
  try {
    console.log(page, pageSize, status)
    const statusArray=status?.split(',')
    const generateQueryString = (params: string[]|string|undefined) => {
      if (Array.isArray(params)) {
        return params.map((param) => `status=${encodeURIComponent(param.trim())}`).join('&');
      }
      return params ? `status=${encodeURIComponent(params)}` : '';  

    }
    const queryString=`page=${page}&pageSize=${pageSize}`
    const statusQueryString = generateQueryString(statusArray);
    const queryParams = statusQueryString ? `${queryString}&${statusQueryString}` : queryString;
    const { data } = await axiosInstance.get(`admin/orders?${queryParams}`);
    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const { data } = error.response;
      const { success, message, statusCode } = data;
      const responseData = data?.data;
      return {
        success,
        message,
        statusCode,
        data: responseData,
      };
    }
    // Handle unexpected errors
    return {
      success: false,
      message: "An unexpected error occurred",
      statusCode: 500,
      data: null,
    };
  }
}
export const approveOrder=async ({
  orderId,
  transactionId,
}:{
  orderId:string;
  transactionId:string;
})=>{
  
  try {
    
    const { data } = await axiosInstance.patch(`admin/orders/${orderId}/approve`, {
      transactionId
    });
    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
  } catch (error) {
    
    if (error instanceof AxiosError && error.response?.data) {
      const { data } = error.response;
      const { success, message, statusCode } = data;
      const responseData = data?.data;
      return {
        success,
        message,
        statusCode,
        data: responseData,
      };
    }
    // Handle unexpected errors
    return {
      success: false,
      message: "An unexpected error occurred",
      statusCode: 500,
      data: null,
    };
  }
}
export const rejectOrder=async ({
  orderId,
  remarks
}:{
  orderId:string;
  remarks?:string;
})=>{
  
  try {
    
    const { data } = await axiosInstance.patch(`admin/orders/${orderId}/reject`, {
      remarks
    });
    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
  } catch (error) {
    
    if (error instanceof AxiosError && error.response?.data) {
      const { data } = error.response;
      const { success, message, statusCode } = data;
      const responseData = data?.data;
      return {
        success,
        message,
        statusCode,
        data: responseData,
      };
    }
    // Handle unexpected errors
    return {
      success: false,
      message: "An unexpected error occurred",
      statusCode: 500,
      data: null,
    };
  }
}
export const cancelOrder=async ({
  orderId,
  remarks
}:{
  orderId:string;
  remarks?:string;
})=>{
  
  try {
    
    const { data } = await axiosInstance.patch(`admin/orders/${orderId}/cancel`, {
      remarks
    });
    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
  } catch (error) {
    
    if (error instanceof AxiosError && error.response?.data) {
      const { data } = error.response;
      const { success, message, statusCode } = data;
      const responseData = data?.data;
      return {
        success,
        message,
        statusCode,
        data: responseData,
      };
    }
    // Handle unexpected errors
    return {
      success: false,
      message: "An unexpected error occurred",
      statusCode: 500,
      data: null,
    };
  }
}
export const processOrder=async ({
  orderId,
}:{
  orderId:string;
})=>{
  
  try {
    
    const { data } = await axiosInstance.patch(`admin/orders/${orderId}/process`);
    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
  } catch (error) {
    
    if (error instanceof AxiosError && error.response?.data) {
      const { data } = error.response;
      const { success, message, statusCode } = data;
      const responseData = data?.data;
      return {
        success,
        message,
        statusCode,
        data: responseData,
      };
    }
    // Handle unexpected errors
    return {
      success: false,
      message: "An unexpected error occurred",
      statusCode: 500,
      data: null,
    };
  }
}
export const shipOrder=async ({
  orderId,
  trackingURL,
}:{
  orderId:string;
  trackingURL:string;
})=>{
  
  try {
    
    const { data } = await axiosInstance.patch(`admin/orders/${orderId}/ship`, {
      trackingURL
    });
    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
  } catch (error) {
    
    if (error instanceof AxiosError && error.response?.data) {
      const { data } = error.response;
      const { success, message, statusCode } = data;
      const responseData = data?.data;
      return {
        success,
        message,
        statusCode,
        data: responseData,
      };
    }
    // Handle unexpected errors
    return {
      success: false,
      message: "An unexpected error occurred",
      statusCode: 500,
      data: null,
    };
  }
}
export const completeOrder=async ({
  orderId,
  totalAmountPaidByCustomer}
:{
  orderId:string;
  totalAmountPaidByCustomer:number;
})=>{
    
    try {
      
      const { data } = await axiosInstance.patch(`admin/orders/${orderId}/complete`, {
        totalAmountPaidByCustomer
      });
      const { success, message, statusCode } = data;
      const responseData = data?.data;
      return {
        success,
        message,
        data: responseData,
        statusCode,
      };
    } catch (error) {
      
      if (error instanceof AxiosError && error.response?.data) {
        const { data } = error.response;
        const { success, message, statusCode } = data;
        const responseData = data?.data;
        return {
          success,
          message,
          statusCode,
          data: responseData,
        };
      }
      // Handle unexpected errors
      return {
        success: false,
        message: "An unexpected error occurred",
        statusCode: 500,
        data: null,
      };
    }
  }
export const returnOrder=async ({
  orderId,
  remarks
}:{
  orderId:string;
  remarks?:string;
})=>{
  
  try {
    
    const { data } = await axiosInstance.patch(`admin/orders/${orderId}/return`, {
      remarks
    });
    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
  } catch (error) {
    
    if (error instanceof AxiosError && error.response?.data) {
      const { data } = error.response;
      const { success, message, statusCode } = data;
      const responseData = data?.data;
      return {
        success,
        message,
        statusCode,
        data: responseData,
      };
    }
    // Handle unexpected errors
    return {
      success: false,
      message: "An unexpected error occurred",
      statusCode: 500,
      data: null,
    };
  }
}
