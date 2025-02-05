/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "../Axios/axiosInstance";
export interface RegisterInfo {
  phoneNo: string;
  name: string;
  password: string;
  zilla: string;
  address: string;
  email?: string;
  upazilla: string;
  shopName: string;
  nomineePhone?: string;
  referralCode?: string;
}
export const register = async ({
  phoneNo,
  name,
  password,
  zilla,
  address,
  upazilla,
  shopName,
  email,
  nomineePhone,
  referralCode,
}: RegisterInfo) => {
  try {
    const { data } = await axiosInstance.post("auth/create-seller", {
      name,
      phoneNo,
      password,
      zilla,
      address,
      email,
      upazilla,
      shopName,
      nomineePhone,
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
  } catch (error: any) {
    const data = error?.response?.data;

    const responseData = data?.data;
    return {
      success: data?.success,
      message: data?.message,
      statusCode: data?.statusCode,
      data: responseData,
    };
  }
};
export const login = async ({
  phoneNo,
  password,
}: {
  phoneNo: string;
  password: string;
}) => {
  try {
    const { data } = await axiosInstance.post("auth/login", {
      phoneNo,
      password,
    });
    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
  } catch (error: any) {
    const data = error.response.data;
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
export const logout = async () => {
  try {
    const { data } = await axiosInstance.post("auth/logout");
    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
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
export const forgotPassword = async ({ phoneNo }: { phoneNo: string }) => {
  try {
    const { data } = await axiosInstance.post("auth/forgot-password", {
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
// define a function for changing password of a user THAT IS LOGGED INRECEIVES THE OLD PASSWORD AND NEW PASSWORDoldPassword: string;newPassword: string;
export const changePassword = async ({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) => {
  try {
    const { data } = await axiosInstance.patch("auth/change-password", {
      currentPassword,
      newPassword,
    });
    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
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
// define a function for updating profile of a user THAT IS LOGGED INreceives the new profile information

export const updateProfile = async ({
  name,
  email,
  shopName,
  zilla,
  upazilla,
  address,
  nomineePhone,
}: {
  name: string;
  email: string;
  shopName: string;
  zilla: string;
  upazilla: string;
  address: string;
  nomineePhone: string;
}) => {
  try {
    const { data } = await axiosInstance.patch("auth/update-profile", {
      name,
      email,
      shopName,
      zilla,
      upazilla,
      address,
      nomineePhone,
    });
    const { success, message, statusCode } = data;
    const responseData = data?.data;
    return {
      success,
      message,
      data: responseData,
      statusCode,
    };
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
