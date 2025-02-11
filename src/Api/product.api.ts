/* eslint-disable @typescript-eslint/no-explicit-any */
export const cloudinaryUrl =
  "https://api.cloudinary.com/v1_1/dqnw5qaoq/image/upload";
import axios from "axios";
import axiosInstance from "../Axios/axiosInstance";

export interface ProductInfo {
  name: string;
  image: File | null;
  category: string;
  basePrice: string;
  stockSize: string;
  suggestedMaxPrice: string;
  description: string;
  location: string;
  deliveryChargeInside: string;
  deliveryChargeOutside: string;
  videoUrl: string;
}

// Function to upload image to Cloudinary and get the URL
const uploadImageToCloudinary = async (image: File) => {
  const formData = new FormData();
  formData.append("file", image);
  formData.append("upload_preset", "upload_pic");

  try {
    const response = await axios.post(cloudinaryUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.secure_url; // Cloudinary returns the URL of the uploaded image
  } catch {
    throw new Error("Failed to upload image");
  }
};
export const uploadImagesToCloudinary = async (images: File[]) => {
  try {
    // Map each image to a upload promise
    const uploadPromises = images.map((image) => {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "upload_pic");

      return axios.post(cloudinaryUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    });

    // Wait for all uploads to complete
    const responses = await Promise.all(uploadPromises);

    // Extract the secure URLs from the responses
    const imageUrls = responses.map((response) => response.data.secure_url);

    return imageUrls;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};

export const addProduct = async ({
  name,
  image,
  category,
  basePrice,
  stockSize,
  suggestedMaxPrice,
  description,
  location,
  deliveryChargeInside,
  deliveryChargeOutside,
  videoUrl,
}: ProductInfo) => {
  try {
    let imageUrl = "";

    // If image exists, upload it to Cloudinary and get the URL
    if (image) {
      imageUrl = await uploadImageToCloudinary(image);
    }

    const payload = {
      name,
      imageUrl, // Cloudinary Image URL
      category,
      basePrice,
      stockSize,
      suggestedMaxPrice,
      description,
      location,
      deliveryChargeInside,
      deliveryChargeOutside,
      videoUrl,
    };

    const { data } = await axiosInstance.post("admin/products", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return {
      success: data?.success,
      message: data?.message,
      data: data?.data,
      statusCode: data?.statusCode,
    };
  } catch (error: any) {
    if (error instanceof axios.AxiosError && error.response?.data) {
      return {
        success: error?.response?.data?.success || false,
        message: error?.response?.data?.message || "Something went wrong",
        statusCode: error?.response?.data?.statusCode || 500,
        data: error?.response?.data?.data || null,
      };
    }
    return {
      success: false,
      message: "An unexpected error occurred",
      statusCode: 500,
      data: null,
    };
  }
};
export const getAdminProducts = async () => {
  try {
    const result = await axiosInstance.get("admin/products");
    const data = result?.data;
    return {
      success: data?.success,
      message: data?.message,
      data: data?.data,
      statusCode: data?.statusCode,
    };
  } catch (error: any) {
    if (error instanceof axios.AxiosError && error.response?.data) {
      return {
        success: error?.response?.data?.success || false,
        message: error?.response?.data?.message || "Something went wrong",
        statusCode: error?.response?.data?.statusCode || 500,
        data: error?.response?.data?.data || null,
      };
    }
    return {
      success: false,
      message: "An unexpected error occurred",
      statusCode: 500,
      data: null,
    };
  }
};
export const uploadProductImages = async (
  productId: number,
  images: File[]
) => {
  try {
    const imageUrls = await uploadImagesToCloudinary(images);
    const { data } = await axiosInstance.post(
      `admin/products/${productId}/images`,
      {
        images: imageUrls,
      }
    );

    return {
      success: data?.success,
      message: data?.message,
      statusCode: data?.statusCode,
    };
  } catch (error: any) {
    if (error instanceof axios.AxiosError && error.response?.data) {
      return {
        success: error?.response?.data?.success || false,
        message: error?.response?.data?.message || "Something went wrong",
        statusCode: error?.response?.data?.statusCode || 500,
      };
    }
    return {
      success: false,
      message: "An unexpected error occurred",
      statusCode: 500,
    };
  }
};
