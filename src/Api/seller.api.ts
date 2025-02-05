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
