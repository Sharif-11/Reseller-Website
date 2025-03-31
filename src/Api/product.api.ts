/* eslint-disable @typescript-eslint/no-explicit-any */
export const cloudinaryUrl =
  "https://api.cloudinary.com/v1_1/dqnw5qaoq/image/upload";
import axios from "axios";
import axiosInstance from "../Axios/axiosInstance";

export interface ProductInfo {
  name: string;
  image: File | null;
  category: string;
  basePrice: number;
  stockSize: number;
  suggestedMaxPrice: number;
  description: string;
  location: string;
  deliveryChargeInside: number;
  deliveryChargeOutside: number;
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
export const uploadImagesToCloudinary = async (
  images: File[],
  onProgress?: (progress: number) => void
) => {
  try {
    let completedUploads = 0;
    const totalImages = images.length;
    
    const uploadPromises = images.map((image) => {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "upload_pic");

      return axios.post(cloudinaryUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const fileProgress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // Calculate overall progress (90% weight for Cloudinary upload)
            const overallProgress = 
              (completedUploads / totalImages * 90) + 
              (fileProgress * 0.9 / totalImages);
            onProgress?.(Math.floor(overallProgress));
          }
        },
      }).then(response => {
        completedUploads++;
        // Update progress when each file completes
        onProgress?.(Math.floor((completedUploads / totalImages) * 90));
        return response;
      });
    });

    const responses = await Promise.all(uploadPromises);
    return responses.map(response => response.data.secure_url);

  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw new Error("Failed to upload images to Cloudinary");
  }
};

export const uploadProductImages = async (
  productId: number,
  images: File[],
  onProgress?: (progress: number) => void
) => {
  try {
    // Reset progress
    onProgress?.(0);

    // Upload to Cloudinary (90% of progress)
    const imageUrls = await uploadImagesToCloudinary(images, (progress) => {
      onProgress?.(progress);
    });

    // Upload to backend (remaining 10% of progress)
    const { data } = await axiosInstance.post(
      `admin/products/${productId}/images`,
      { images: imageUrls },
      {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const backendProgress = Math.round(
              (progressEvent.loaded * 10) / progressEvent.total
            );
            onProgress?.(90 + backendProgress);
          }
        },
      }
    );

    // Complete
    onProgress?.(100);

    return {
      success: data?.success ?? true,
      message: data?.message || "Images uploaded successfully",
      statusCode: data?.statusCode || 200,
      data: data?.data,
    };

  } catch (error: any) {
    // Reset progress on error
    onProgress?.(0);

    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        statusCode: error.response?.status || 500,
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Upload failed",
      statusCode: 500,
    };
  }
};
export const getProductImages = async (productId: number) => {
  try {
    const { data } = await axiosInstance.get(`admin/products/${productId}/images`);
    return {
      success: data?.success,
      message: data?.message,
      data: data?.data,
      statusCode: data?.statusCode,
    };
  }
  catch (error: any) {
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
}
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

export const publishProduct = async (productId: number) => {
  try {
    const { data } = await axiosInstance.post(`admin/products/${productId}/publish`);
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
}
export const unpublishProduct = async (productId: number) => {
  try {
    const { data } = await axiosInstance.post(`admin/products/${productId}/unpublish`);
    return {
      success: data?.success,
      message: data?.message,
      statusCode: data?.statusCode,
    };
  }
  catch (error: any) {
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
}
export const addProductMeta = async (productId: number, meta: { key: string; value: string }[]) => {
  try {
    const { data } = await axiosInstance.put(`admin/products/${productId}/meta`, {meta});
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
}
export const getProductMeta = async (productId: number) => {
  try {
    const { data } = await axiosInstance.get(`admin/products/${productId}/meta`);
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
}
export const updateProduct = async (productId: number, productInfo: ProductInfo) => {
  try {
    let imageUrl = "";

    // If image exists, upload it to Cloudinary and get the URL
    if (productInfo.image) {
      imageUrl = await uploadImageToCloudinary(productInfo.image);
    }

    const payload = {
      name: productInfo.name,
      imageUrl, // Cloudinary Image URL
      category: productInfo.category,
      basePrice: productInfo.basePrice,
      stockSize: productInfo.stockSize,
      suggestedMaxPrice: productInfo.suggestedMaxPrice,
      description: productInfo.description,
      location: productInfo.location,
      deliveryChargeInside: productInfo.deliveryChargeInside,
      deliveryChargeOutside: productInfo.deliveryChargeOutside,
      videoUrl: productInfo.videoUrl,
    };

    const { data } = await axiosInstance.patch(`admin/products/${productId}`, payload, {
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
}
export const deleteProductImage = async (productId: number, imageId: number) => {
  try {
    const { data } = await axiosInstance.delete(`admin/products/${productId}/images/${imageId}`);
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
}