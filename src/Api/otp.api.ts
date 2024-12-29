import axiosInstance from "../Axios/axiosInstance";

interface SendOtpResponse {
  success: boolean;
  message?: string;
  error: string | null;
}

export const sendOtp = async (mobileNo: string): Promise<SendOtpResponse> => {
  try {
    const result = await axiosInstance.post("auth/send-otp", { mobileNo });
    return {
      success: result.data.success,
      error: null,
      message: result.data.message,
    };
  } catch (error) {
    return {
      success: false,

      error:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response?.data?.message ||
        "An unexpected error occurred.",
    };
  }
};
export const verifyOtp = async (mobileNo: string, otp: string) => {
  try {
    const result = await axiosInstance.post("auth//verify-otp", {
      otp,
      mobileNo,
    });
    return {
      success: result.data.success,
      error: null,
      message: result.data.message,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      success: false,
      error: error.response.data.message,
    };
  }
};
