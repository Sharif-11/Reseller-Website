/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from "axios";
import axiosInstance from "../Axios/axiosInstance";

interface SendOtpResponse {
  success: boolean;
  statusCode: number;
  data?: any;
  message: string;
}

// Define a type for the API response data structure
interface ApiResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data?: any;
}

export const sendOtp = async (phoneNo: string): Promise<SendOtpResponse> => {
  try {
    const { data } = await axiosInstance.post<ApiResponse>("auth/send-otp", {
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
      const { success, message, statusCode } = data as ApiResponse;
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

export const verifyOtp = async (
  phoneNo: string,
  otp: string
): Promise<SendOtpResponse> => {
  try {
    const { data } = await axiosInstance.post<ApiResponse>("auth/verify-otp", {
      otp,
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
      const { success, message, statusCode } = data as ApiResponse;
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
