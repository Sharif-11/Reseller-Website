import { AxiosError } from "axios";
import axiosInstance from "../Axios/axiosInstance";

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
export const getWithdrawHistory = async (page: number) => {
  try {
    const { data } = await axiosInstance.get(`sellers/withdraw?page=${page}`);
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