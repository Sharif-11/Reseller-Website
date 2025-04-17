import { AxiosError } from "axios";
import axiosInstance from "../Axios/axiosInstance";
import { OrderData } from "../types/order.types";

export const addReferralCode = async (referralCode: string) => {
  try {
    const { data } = await axiosInstance.post("sellers/add-referral", {
      referralCode,
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
};
export const sendWalletOTP = async (phoneNo: string) => {
  try {
    const { data } = await axiosInstance.post("sellers/wallets/send-otp", {
      phoneNo,
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

export const verifyWalletOTP = async (phoneNo: string, otp: string) => {
  try {
    const { data } = await axiosInstance.post("sellers/wallets/verify-otp", {
      phoneNo,
      otp,
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
export const getWalletList = async () => {
  try {
    const { data } = await axiosInstance.get("sellers/wallets");
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
export const addWallet = async (phoneNo: string, type: string) => {
  try {
    const { data } = await axiosInstance.post("sellers/wallets", {
      walletName:type,
      walletPhoneNo:phoneNo
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
export const requestWithdraw = async ({
  amount,
  walletName,
  walletPhoneNo
}: {
  amount: number;
  walletName: string;
  walletPhoneNo: string;
}) => {

  try {
    const { data } = await axiosInstance.post("sellers/withdraw", {
      amount,
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
export const getWithdrawHistory = async ({
  status,
  page = 1,
  pageSize = 10,
  search = ''
}: {
  status?: 'pending' | 'completed' | 'rejected' | 'cancelled';
  page?: number;
  pageSize?: number;
  search?: string;
}) => {
  try {
    const { data } = await axiosInstance.get(`sellers/withdraw`, {
      params: {
        status,
        page,
        pageSize,
        search
      }
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
    return {
      success: false,
      message: "An unexpected error occurred",
      statusCode: 500,
      data: null,
    };
  }
}
export const cancelWithdrawRequest = async (withdrawId: string) => {
  try {
    const { data } = await axiosInstance.delete(`sellers/withdraw/${withdrawId}`);
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

export const getTransactionHistory = async ({
  page = 1,
  pageSize = 10,
}: {
  page?: number;
  pageSize?: number;
}) => {
  try {
    const { data } = await axiosInstance.get("sellers/transactions", {
      params: {
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
export const getProduct=async(productId:string)=>{
  try {
    const { data } = await axiosInstance.get(`sellers/products/${productId}`);
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
export const getAdminWallets=async ()=>{

  try {
    const { data } = await axiosInstance.get(`sellers/wallets/admin-wallets`);
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
export const createOrder=async (orderData:OrderData)=>{
  try {
    const { data } = await axiosInstance.post(`sellers/orders`, orderData);
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
export const getOrders=async ({
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
    const { data } = await axiosInstance.get(`sellers/orders?${queryParams}`);
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
