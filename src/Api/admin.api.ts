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
    transactionPhoneNo: string;
    remarks?: string;
}) => {
  try {
    const { data } = await axiosInstance.patch(`admin/withdraw/${id}/complete`,{

        transactionId,
        transactionPhoneNo,
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