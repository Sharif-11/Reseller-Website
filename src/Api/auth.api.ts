import axiosInstance from "../Axios/axiosInstance";

export const register = async ({
  mobileNo,
  name,
  password,
  zilla,
  address,
  sellerCode,
  email,
}: {
  mobileNo: string;
  name: string;
  password: string;
  zilla: string;
  address: string;
  email: string;
  sellerCode: string;
}) => {
  try {
    const { data } = await axiosInstance.post("auth/create-seller", {
      name,
      mobileNo,
      password,
      zilla,
      address,
      email,
      sellerCode,
    });
    return {
      success: data?.success,
      message: data?.message,
      error: null,
      data: data?.data,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const { data } = error.response;
    return {
      success: data?.success,
      error: data?.message,
      message: null,
      data: null,
    };
  }
};
