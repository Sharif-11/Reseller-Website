/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "../Axios/axiosInstance";

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
}: {
  phoneNo: string;
  name: string;
  password: string;
  zilla: string;
  address: string;
  email: string;
  upazilla: string;
  shopName: string;
  nomineePhone: string;
}) => {
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
