import axiosInstance from "../Axios/axiosInstance";

interface SendOtpResponse {
  success: boolean;
  statusCode: number;
  data?: any;
  message: string;
}

export const sendOtp = async (phoneNo: string): Promise<SendOtpResponse> => {
  try {
    const { data } = await axiosInstance.post("auth/send-otp", { phoneNo });
    const { success, message, data: responseData, statusCode } = data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
  } catch (error) {
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
};
export const verifyOtp = async (phoneNo: string, otp: string) => {
  try {
    const { data } = await axiosInstance.post("auth//verify-otp", {
      otp,
      phoneNo,
    });
    const { success, message, data: responseData, statusCode } = data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
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
};
